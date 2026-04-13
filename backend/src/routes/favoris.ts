// Routes des favoris — KreAgency (utilisateurs connectés uniquement)
import { Router } from 'express';
import { getFavoris, addFavori, removeFavori } from '../controllers/favorisController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get(   '/',         getFavoris);
router.post(  '/',         addFavori);
router.delete('/:bienId',  removeFavori);

export default router;
