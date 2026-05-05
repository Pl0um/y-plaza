import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes          from './routes/auth';
import biensRoutes         from './routes/biens';
import agencesRoutes       from './routes/agences';
import utilisateursRoutes  from './routes/utilisateurs';
import transactionsRoutes  from './routes/transactions';
import favorisRoutes       from './routes/favoris';
import { errorHandler }    from './middlewares/errorHandler';

// Chargement des variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT        = process.env.PORT        ?? 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

// ─── Sécurité — Headers HTTP ──────────────────────────────────────────────────
// Helmet positionne les headers de sécurité standards sur toutes les réponses :
// X-Frame-Options (anti-clickjacking), X-Content-Type-Options (anti-sniffing),
// Strict-Transport-Security (HTTPS forcé), Content-Security-Policy, etc.

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      // Styles inline autorisés pour les CSS Modules + Google Fonts
      styleSrc:    ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:     ["'self'", 'fonts.gstatic.com'],
      // Images : domaine propre, data URIs, Supabase Storage et Picsum (seed)
      imgSrc:      ["'self'", 'data:', '*.supabase.co', 'picsum.photos'],
      // Scripts : domaine propre uniquement (pas de CDN externe)
      scriptSrc:   ["'self'"],
      // Requêtes fetch/XHR : domaine propre + Supabase Auth et API
      connectSrc:  ["'self'", '*.supabase.co'],
    },
  },
  // Désactivé pour éviter les conflits avec les ressources cross-origin (Leaflet, Picsum)
  crossOriginEmbedderPolicy: false,
}));

// Masque le header "X-Powered-By: Express" pour ne pas révéler la stack technique
app.disable('x-powered-by');

// ─── Logs HTTP ────────────────────────────────────────────────────────────────
// 'dev' en développement (coloré, concis), 'combined' en production (format Apache)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Sécurité — Rate Limiting ─────────────────────────────────────────────────

// Limite globale : 100 requêtes / 15 min / IP sur toute l'API
// Protège contre le scraping, l'énumération et les abus généraux
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Trop de requêtes, réessayez dans 15 minutes.' },
  standardHeaders: true,  // retourne RateLimit-* dans les headers
  legacyHeaders: false,   // désactive X-RateLimit-* (obsolète)
});
app.use('/api', globalLimiter);

// Login : 5 tentatives / 15 min / IP (uniquement les échecs comptent)
// Protège contre le bruteforce de mots de passe
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Trop de tentatives. Accès bloqué 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // un login réussi ne consomme pas le quota
});
app.use('/api/auth/login', loginLimiter);

// Inscription : 5 comptes / heure / IP
// Protège contre la création de comptes en masse
app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Trop de tentatives d'inscription. Réessayez dans 1 heure." },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Reset mot de passe : 5 demandes / 15 min / IP
// Protège contre le bombing d'emails
app.use('/api/auth/reset-password', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Trop de demandes de réinitialisation. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Invitations : 10 / heure / IP (admin uniquement, mais on limite quand même)
app.use('/api/auth/invite', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Limite d'invitations atteinte. Réessayez dans 1 heure." },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Refresh token : 30 / 15 min / IP — empêche le bruteforce de refresh tokens volés
app.use('/api/auth/refresh', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Trop de tentatives de renouvellement. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Middlewares globaux ──────────────────────────────────────────────────────

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
// Parse les cookies — nécessaire pour lire le cookie httpOnly sb-token
app.use(cookieParser());
// Limite la taille des corps de requête pour éviter les attaques par payload surdimensionné
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Routes API ───────────────────────────────────────────────────────────────

app.use('/api/auth',          authRoutes);
app.use('/api/biens',         biensRoutes);
app.use('/api/agences',       agencesRoutes);
app.use('/api/utilisateurs',  utilisateursRoutes);
app.use('/api/transactions',  transactionsRoutes);
app.use('/api/favoris',       favorisRoutes);

// Route de santé — ne révèle pas NODE_ENV ni la stack technique
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'KreAgency API opérationnelle' });
});

// ─── Middleware d'erreurs (doit être le dernier) ──────────────────────────────

app.use(errorHandler);

// ─── Démarrage du serveur ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[KreAgency API] Serveur démarré sur http://localhost:${PORT}`);
  console.log(`[KreAgency API] Mode : ${process.env.NODE_ENV ?? 'development'}`);
});

export default app;
