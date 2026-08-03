import { Router } from 'express';
import { getTables, generateTableQR, createTable, deleteTable } from '../controllers/qrController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/tables', authenticateAdmin, getTables);
router.post('/tables', authenticateAdmin, createTable);
router.delete('/tables/:id', authenticateAdmin, deleteTable);
router.get('/table/:tableNumber', generateTableQR);

export default router;

