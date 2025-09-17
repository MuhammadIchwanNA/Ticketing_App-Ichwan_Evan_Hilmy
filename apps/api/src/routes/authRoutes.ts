import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;