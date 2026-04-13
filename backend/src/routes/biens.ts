// Routes des biens — KreAgency
// Matrice des droits :
//   GET    /          → public
//   GET    /:id       → public
//   POST   /          → commercial, admin
//   PUT    /:id       → commercial, admin
//   DELETE /:id       → admin
import { Router } from 'express';
import {
  getAllBiens,
  getBienById,
  createBien,
  updateBien,
  deleteBien,
} from '../controllers/biensController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.get('/',    getAllBiens);
router.get('/:id', getBienById);

router.post(  '/',    authenticate, requireRole('commercial', 'admin'), createBien);
router.put(   '/:id', authenticate, requireRole('commercial', 'admin'), updateBien);
router.delete('/:id', authenticate, requireRole('admin'),               deleteBien);

export default router;
