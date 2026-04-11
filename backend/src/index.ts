import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import biensRoutes from './routes/biens';
import agencesRoutes from './routes/agences';
import utilisateursRoutes from './routes/utilisateurs';
import { errorHandler } from './middlewares/errorHandler';

// Chargement des variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

// ─── Middlewares globaux ──────────────────────────────────────────────────────

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes API ───────────────────────────────────────────────────────────────

app.use('/api/biens', biensRoutes);
app.use('/api/agences', agencesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);

// Route de santé — permet de vérifier que l'API répond
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'KreAgency API opérationnelle',
    env: process.env.NODE_ENV ?? 'development',
  });
});

// ─── Middleware d'erreurs (doit être le dernier) ──────────────────────────────

app.use(errorHandler);

// ─── Démarrage du serveur ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[KreAgency API] Serveur démarré sur http://localhost:${PORT}`);
  console.log(`[KreAgency API] Mode : ${process.env.NODE_ENV ?? 'development'}`);
});

export default app;
