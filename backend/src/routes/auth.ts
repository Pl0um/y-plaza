// Routes d'authentification — KreAgency
import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  updateMe,
  invite,
  resetPassword,
} from '../controllers/authController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// ── Routes publiques ──────────────────────────────────────────────────────────
router.post('/register',       register);
router.post('/login',          login);
router.post('/logout',         logout);
router.post('/reset-password', resetPassword);

// ── Routes authentifiées ──────────────────────────────────────────────────────
router.get('/me',   authenticate, me);
router.patch('/me', authenticate, updateMe);

// ── Routes admin uniquement ───────────────────────────────────────────────────
router.post('/invite', authenticate, requireRole('admin'), invite);

export default router;
