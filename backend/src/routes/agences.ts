// Routes des agences — KreAgency
// Matrice des droits :
//   GET  /            → public
//   GET  /:id         → public
//   GET  /:id/biens   → public
//   POST /            → admin
//   PUT  /:id         → admin
import { Router } from 'express';
import {
  getAllAgences,
  getAgenceById,
  getBiensByAgence,
  createAgence,
  updateAgence,
} from '../controllers/agencesController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.get('/',           getAllAgences);
router.get('/:id',        getAgenceById);
router.get('/:id/biens',  getBiensByAgence);

router.post('/',    authenticate, requireRole('admin'), createAgence);
router.put('/:id',  authenticate, requireRole('admin'), updateAgence);

export default router;
