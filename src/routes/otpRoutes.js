import { Router } from 'express';
import { sendOtp, verifyOtp, forgotPassword, resetPassword } from '~/controllers/otpController';

const router = Router();

// Public routes — NO AUTH
router.post('/send-otp', sendOtp); 
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 