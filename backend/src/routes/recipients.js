import express from 'express';
import Recipient from '../models/Recipient.js';
import Kreis from '../models/Kreis.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Alle Empfänger (mit zugehörigem Kreis)
router.get('/', auth, async (req, res) => {
  try {
    const recipients = await Recipient.findAll({ include: Kreis });
    res.json(recipients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Empfänger anlegen
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Empfänger anlegen.' });
  const { name, email, kreisId, rolle } = req.body;
  if (!name || !email || !kreisId || !rolle) return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  try {
    // Prüfe, ob der Kreis existiert
    const kreis = await Kreis.findByPk(kreisId);
    if (!kreis) return res.status(400).json({ message: 'Kreis nicht gefunden.' });
    const recipient = await Recipient.create({ name, email, rolle, KreisId: kreisId });
    const recipientWithKreis = await Recipient.findByPk(recipient.id, { include: Kreis });
    res.status(201).json(recipientWithKreis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Empfänger aktualisieren
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Empfänger bearbeiten.' });
  const { name, email, kreisId, rolle } = req.body;
  if (!name || !email || !kreisId || !rolle) return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  try {
    const kreis = await Kreis.findByPk(kreisId);
    if (!kreis) return res.status(400).json({ message: 'Kreis nicht gefunden.' });
    const [updatedRows] = await Recipient.update(
      { name, email, rolle, KreisId: kreisId },
      { where: { id: req.params.id } }
    );
    if (!updatedRows) return res.status(404).json({ message: 'Empfänger nicht gefunden' });
    const recipientWithKreis = await Recipient.findByPk(req.params.id, { include: Kreis });
    res.json(recipientWithKreis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Empfänger löschen
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Empfänger löschen.' });
  try {
    const deletedRows = await Recipient.destroy({ where: { id: req.params.id } });
    if (!deletedRows) return res.status(404).json({ message: 'Empfänger nicht gefunden' });
    res.json({ message: 'Empfänger gelöscht' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router; 