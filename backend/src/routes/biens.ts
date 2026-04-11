import { Router } from 'express';
import {
  getAllBiens,
  getBienById,
  createBien,
  updateBien,
  deleteBien,
} from '../controllers/biensController';

const router = Router();

// GET    /api/biens          → liste avec filtres (ville, type_bien, type_transaction, prix_min, prix_max, statut)
// GET    /api/biens/:id      → détail d'un bien
// POST   /api/biens          → créer un bien
// PUT    /api/biens/:id      → modifier un bien
// DELETE /api/biens/:id      → supprimer un bien

router.get('/', getAllBiens);
router.get('/:id', getBienById);
router.post('/', createBien);
router.put('/:id', updateBien);
router.delete('/:id', deleteBien);

export default router;
