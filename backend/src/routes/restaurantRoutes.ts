import { Router } from 'express';
import { getRestaurant, updateRestaurant } from '../controllers/restaurantController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getRestaurant);
router.put('/', authenticateAdmin, updateRestaurant);

export default router;
