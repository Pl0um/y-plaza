// Routes d'authentification — KreAgency
import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  me,
  updateMe,
  invite,
  resetPassword,
} from '../controllers/authController';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfilSchema,
  inviteSchema,
} from '../validators/schemas';

const router = Router();

// ── Routes publiques ──────────────────────────────────────────────────────────
router.post('/register',       validate(registerSchema),      register);
router.post('/login',          validate(loginSchema),         login);
router.post('/logout',         logout);
router.post('/refresh',        refresh);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// ── Routes authentifiées ──────────────────────────────────────────────────────
router.get('/me',   authenticate, me);
router.patch('/me', authenticate, validate(updateProfilSchema), updateMe);

// ── Routes admin uniquement ───────────────────────────────────────────────────
router.post('/invite', authenticate, requireRole('admin'), validate(inviteSchema), invite);

export default router;
