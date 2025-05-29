import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import { BearerStrategy } from 'passport-azure-ad';
import { jwtDecode } from 'jwt-decode';
import { sendMail } from '../services/sendMail.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Ungültige Zugangsdaten' });
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ message: 'Ungültige Zugangsdaten' });
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { email: user.email, role: user.role } });
});

// Registrierung (nur Admin)
router.post('/register', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen neue Nutzer anlegen.' });
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email und Passwort erforderlich.' });
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: 'Nutzer existiert bereits.' });
  const user = new User({ email, password, role: role || 'user' });
  await user.save();
  res.status(201).json({ message: 'Nutzer angelegt.' });
});

// Passwort-Reset anfordern
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(200).json({ message: 'Falls die E-Mail existiert, wurde eine Reset-Mail versendet.' });
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h
  await user.setResetToken(token, expires);
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendMail({
    to: [user.email],
    subject: 'Passwort zurücksetzen',
    body: `<p>Hallo,<br>du hast einen Passwort-Reset angefordert.<br>Klicke auf folgenden Link, um ein neues Passwort zu setzen:<br><a href="${resetUrl}">${resetUrl}</a><br>Der Link ist 1 Stunde gültig.</p>`,
    attachments: []
  });
  res.json({ message: 'Falls die E-Mail existiert, wurde eine Reset-Mail versendet.' });
});

// Passwort mit Token zurücksetzen
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({ where: { resetToken: token, resetTokenExpires: { [Op.gt]: new Date() } } });
  if (!user) return res.status(400).json({ message: 'Token ungültig oder abgelaufen.' });
  await user.update({ password, resetToken: null, resetTokenExpires: null });
  res.json({ message: 'Passwort erfolgreich zurückgesetzt.' });
});

// Microsoft SSO-Login
router.post('/microsoft', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Kein Token übergeben.' });
  try {
    const decoded = jwtDecode(token);
    const email = decoded.preferred_username || decoded.email;
    const allowedUsers = (process.env.MS_ALLOWED_USERS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const allowedDomain = process.env.MS_ALLOWED_DOMAIN || '@julis-sh.de';
    if (allowedUsers.length > 0) {
      if (!allowedUsers.includes(email.toLowerCase()) && !(decoded.oid && allowedUsers.includes(decoded.oid))) {
        return res.status(403).json({ message: 'Nur bestimmte Accounts erlaubt.' });
      }
    } else {
      if (!email || !email.endsWith(allowedDomain)) {
        return res.status(403).json({ message: 'Nur Organisation-Accounts erlaubt.' });
      }
    }
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ email, password: crypto.randomBytes(32).toString('hex'), role: 'user' });
    }
    const appToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token: appToken, user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ message: 'Microsoft-Token ungültig.' });
  }
});

export default router; 