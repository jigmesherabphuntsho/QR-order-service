import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authenticateAdmin, createMenuItem);
router.put('/:id', authenticateAdmin, updateMenuItem);
router.patch('/:id/availability', authenticateAdmin, toggleAvailability);
router.delete('/:id', authenticateAdmin, deleteMenuItem);

export default router;
