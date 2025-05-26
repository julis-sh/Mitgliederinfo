import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import recipientsRoutes from './routes/recipients.js';
import templatesRoutes from './routes/templates.js';
import uploadRoutes from './routes/upload.js';
import mailRoutes from './routes/mail.js';
import auditlogRoutes from './routes/auditlog.js';
import kreiseRouter from './routes/kreise.js';
import szenarienRouter from './routes/szenarien.js';
import path from 'path';
import usersRouter from './routes/users.js';
import sequelize from './models/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health-Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MariaDB Connect
(async () => {
  try {
    await sequelize.authenticate();
    console.log('MariaDB verbunden');
    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
    // Optional: Tabellen synchronisieren (nur für Entwicklung!)
    // await sequelize.sync();
  } catch (err) {
    console.error('MariaDB Fehler:', err);
  }
})();

app.use('/api/auth', authRoutes);
app.use('/api/recipients', recipientsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/auditlog', auditlogRoutes);
app.use('/api/kreise', kreiseRouter);
app.use('/api/szenarien', szenarienRouter);
app.use('/api/users', usersRouter);
app.use('/uploads', express.static(path.resolve('uploads'))); 