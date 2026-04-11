import { Router } from 'express';
import {
  getAllAgences,
  getAgenceById,
  getBiensByAgence,
} from '../controllers/agencesController';

const router = Router();

// GET /api/agences              → liste des 12 agences
// GET /api/agences/:id          → détail d'une agence
// GET /api/agences/:id/biens    → biens rattachés à une agence

router.get('/', getAllAgences);
router.get('/:id', getAgenceById);
router.get('/:id/biens', getBiensByAgence);

export default router;
