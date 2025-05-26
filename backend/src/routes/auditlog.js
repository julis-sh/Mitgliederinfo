import express from 'express';
import AuditLog from '../models/AuditLog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Alle AuditLogs (nur Admin)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen das Audit-Log sehen.' });
  const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
  res.json(logs);
});

export default router; 