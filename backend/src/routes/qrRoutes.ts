import { Router } from 'express';
import { getTables, generateTableQR } from '../controllers/qrController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/tables', authenticateAdmin, getTables);
router.get('/table/:tableNumber', generateTableQR);

export default router;
