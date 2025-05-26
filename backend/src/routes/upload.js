import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// Datei-Upload (nur Admin)
router.post('/', auth, upload.single('file'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Nur Admins dürfen Dateien hochladen.' });
  if (!req.file) return res.status(400).json({ message: 'Keine Datei hochgeladen.' });
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

export default router; 