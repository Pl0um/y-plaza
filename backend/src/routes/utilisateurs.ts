// Routes des utilisateurs — KreAgency
// Matrice des droits :
//   GET  /               → directeur, admin
//   PUT  /:id/role       → admin uniquement
import { Router } from 'express';
import {
  getAllUtilisateurs,
  updateUtilisateurRole,
} from '../controllers/utilisateursController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.get('/',          authenticate, requireRole('directeur', 'admin'), getAllUtilisateurs);
router.put('/:id/role',  authenticate, requireRole('admin'),              updateUtilisateurRole);

export default router;
