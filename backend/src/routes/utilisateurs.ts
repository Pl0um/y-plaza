import { Router } from 'express';
import { getAllUtilisateurs } from '../controllers/utilisateursController';

const router = Router();

// GET /api/utilisateurs → liste des agents
router.get('/', getAllUtilisateurs);

export default router;
