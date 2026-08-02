import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/orderController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', createOrder);
router.get('/', authenticateAdmin, getOrders);
router.get('/stats', authenticateAdmin, getDashboardStats);
router.get('/:id', getOrderById);
router.patch('/:id/status', authenticateAdmin, updateOrderStatus);

export default router;
