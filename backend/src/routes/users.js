import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Alle User (nur Admin)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen die User sehen.' });
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});

// User löschen (optional)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen User löschen.' });
  const deletedRows = await User.destroy({ where: { id: req.params.id } });
  if (!deletedRows) return res.status(404).json({ message: 'User nicht gefunden' });
  res.json({ message: 'User gelöscht' });
});

// User bearbeiten (optional)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen User bearbeiten.' });
  const { password, ...rest } = req.body;
  let update = { ...rest };
  if (password) update.password = password;
  const [updatedRows, [user]] = await User.update(update, { where: { id: req.params.id }, returning: true });
  if (!updatedRows) return res.status(404).json({ message: 'User nicht gefunden' });
  res.json(user);
});

export default router; 