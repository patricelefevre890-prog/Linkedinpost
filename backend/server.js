/**
 * Serveur principal de l'application LinkedIn Content Generator
 * Utilise Express.js avec intégration Claude Haiku pour minimiser les coûts
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateContent } from './routes/generate.js';
import { uploadDocument } from './routes/upload.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Sécurité de base ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting pour contrôler les coûts API ────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // Fenêtre de 1 minute
  max: 10,                    // Max 10 requêtes par minute par IP
  message: { error: 'Trop de requêtes. Attendez avant de réessayer.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Trop d\'uploads. Attendez avant de réessayer.' },
});

// ── Configuration upload fichiers ──────────────────────────────────────────────
const storage = multer.memoryStorage(); // Stockage en mémoire (pas de disque)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez PDF, TXT ou MD.'));
    }
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.post('/api/upload', uploadLimiter, upload.single('document'), uploadDocument);
app.post('/api/generate', apiLimiter, generateContent);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Gestion globale des erreurs ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Erreur non gérée:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fichier trop volumineux (max 5 MB).' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur.',
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
});

export default app;
