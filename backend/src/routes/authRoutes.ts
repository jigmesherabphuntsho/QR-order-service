import { Router } from 'express';
import { loginAdmin, registerAdmin, getMe } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', authenticateAdmin, getMe);

export default router;
