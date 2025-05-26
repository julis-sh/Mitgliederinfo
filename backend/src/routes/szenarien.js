import express from 'express';
import Szenario from '../models/Szenario.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Alle Szenarien
router.get('/', auth, async (req, res) => {
  const szenarien = await Szenario.findAll({ order: [['order', 'ASC'], ['label', 'ASC']] });
  res.json(szenarien);
});

// Szenario anlegen (nur Admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Szenarien anlegen.' });
  try {
    const szenario = await Szenario.create(req.body);
    res.status(201).json(szenario);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Szenario bearbeiten (nur Admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Szenarien bearbeiten.' });
  try {
    const [updatedRows, [szenario]] = await Szenario.update(req.body, { where: { id: req.params.id }, returning: true });
    if (!updatedRows) return res.status(404).json({ message: 'Szenario nicht gefunden' });
    res.json(szenario);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Szenario löschen (nur Admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Szenarien löschen.' });
  const deletedRows = await Szenario.destroy({ where: { id: req.params.id } });
  if (!deletedRows) return res.status(404).json({ message: 'Szenario nicht gefunden' });
  res.json({ message: 'Szenario gelöscht' });
});

// PATCH /order: Reihenfolge speichern
router.patch('/order', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins.' });
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids muss ein Array sein.' });
  for (let i = 0; i < ids.length; i++) {
    await Szenario.update({ order: i }, { where: { id: ids[i] } });
  }
  res.json({ message: 'Reihenfolge gespeichert.' });
});

export default router; 