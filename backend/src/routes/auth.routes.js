import express from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import { createRateLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many authentication attempts. Please wait before trying again.' });

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

export default router;
