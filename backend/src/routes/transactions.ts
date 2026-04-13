// Routes des transactions — KreAgency
import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
} from '../controllers/transactionsController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// Toutes les routes transactions requièrent une authentification
router.use(authenticate);

router.get(  '/',    requireRole('gestionnaire_ventes', 'directeur', 'admin'), getAllTransactions);
router.get(  '/:id', requireRole('gestionnaire_ventes', 'directeur', 'admin'), getTransactionById);
router.post( '/',    requireRole('gestionnaire_ventes', 'admin'),              createTransaction);
router.put(  '/:id', requireRole('gestionnaire_ventes', 'admin'),              updateTransaction);

export default router;
