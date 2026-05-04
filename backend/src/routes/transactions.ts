// Routes des transactions — KreAgency
import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
} from '../controllers/transactionsController';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { transactionSchema, transactionUpdateSchema } from '../validators/schemas';

const router = Router();

// Toutes les routes transactions requièrent une authentification
router.use(authenticate);

router.get(  '/',    requireRole('gestionnaire_ventes', 'directeur', 'admin'), getAllTransactions);
router.get(  '/:id', requireRole('gestionnaire_ventes', 'directeur', 'admin'), getTransactionById);
router.post( '/',    requireRole('gestionnaire_ventes', 'admin'), validate(transactionSchema),       createTransaction);
router.put(  '/:id', requireRole('gestionnaire_ventes', 'admin'), validate(transactionUpdateSchema), updateTransaction);

export default router;
