import { Router } from 'express';
import { getTables, generateTableQR, updateTableQR, createTable, deleteTable, getNetworkInfo } from '../controllers/qrController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/network-info', getNetworkInfo);
router.get('/tables', authenticateAdmin, getTables);
router.post('/tables', authenticateAdmin, createTable);
router.get('/table/:tableNumber', generateTableQR);
router.patch('/table/:tableNumber', authenticateAdmin, updateTableQR);
router.delete('/table/:tableNumber', authenticateAdmin, deleteTable);

export default router;
