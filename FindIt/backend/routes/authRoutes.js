import express from 'express';
import { sendOtp, verifyOtp, signup, login } from '../controllers/authController.js';
import rateLimitOtp from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/send-otp', rateLimitOtp, sendOtp);

router.post('/verify-otp', verifyOtp);

router.post('/signup', signup);

router.post('/login', login);

export default router;
