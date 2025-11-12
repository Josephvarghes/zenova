import { Router } from 'express';
import {sendOtp,verifyOtp, forgotPassword, resetPassword,signupWithOtp  }from '~/controllers/otpController';
import validate from '~/middlewares/validate';
import otpValidation from '~/validations/otpValidation';
import catchAsync from '~/utils/catchAsync';


const router = Router();

// Public routes — NO AUTH
router.post('/send-otp',validate(otpValidation.sendOtp), sendOtp); 
router.post('/verify-otp', validate(otpValidation.verifyOtp), catchAsync(verifyOtp));
router.post('/signup', validate(otpValidation.signupWithOtp), catchAsync(signupWithOtp)); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 