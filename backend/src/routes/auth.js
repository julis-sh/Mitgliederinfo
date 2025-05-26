import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

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
  // Mailversand (hier nodemailer, ggf. anpassen)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'noreply@julis-sh.de',
    to: user.email,
    subject: 'Passwort zurücksetzen',
    html: `<p>Hallo,<br>du hast einen Passwort-Reset angefordert.<br>Klicke auf folgenden Link, um ein neues Passwort zu setzen:<br><a href="${resetUrl}">${resetUrl}</a><br>Der Link ist 1 Stunde gültig.</p>`
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

export default router; 