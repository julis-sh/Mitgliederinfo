import express from 'express';
import Kreis from '../models/Kreis.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Alle Kreise
router.get('/', auth, async (req, res) => {
  const kreise = await Kreis.findAll({ order: [['order', 'ASC'], ['name', 'ASC']] });
  res.json(kreise);
});

// Kreis anlegen (nur Admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Kreise anlegen.' });
  try {
    const kreis = await Kreis.create(req.body);
    res.status(201).json(kreis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Kreis bearbeiten (nur Admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Kreise bearbeiten.' });
  try {
    const [updatedRows, [kreis]] = await Kreis.update(req.body, { where: { id: req.params.id }, returning: true });
    if (!updatedRows) return res.status(404).json({ message: 'Kreis nicht gefunden' });
    res.json(kreis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Kreis löschen (nur Admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Kreise löschen.' });
  const deletedRows = await Kreis.destroy({ where: { id: req.params.id } });
  if (!deletedRows) return res.status(404).json({ message: 'Kreis nicht gefunden' });
  res.json({ message: 'Kreis gelöscht' });
});

// PATCH /order: Reihenfolge speichern
router.patch('/order', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins.' });
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids muss ein Array sein.' });
  for (let i = 0; i < ids.length; i++) {
    await Kreis.update({ order: i }, { where: { id: ids[i] } });
  }
  res.json({ message: 'Reihenfolge gespeichert.' });
});

export default router; 