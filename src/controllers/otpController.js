import Otp from '../models/otpModel';
import User from '../models/userModel';
import { generateAndStoreOtp } from '../utils/otp.js';
import { sendOtpEmail } from '~/services/emailService/index.js'; 

// Helper for consistent success response
const successResponse = (res, message, data = {}) => {
  return res.json({ success: true, data, message });
};

// Helper for consistent error response
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, data: {}, message });
};

export const sendOtp = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    await generateAndStoreOtp(user._id, email, type);
    return successResponse(res, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, type } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const otpDoc = await Otp.findOne({ user: user._id, type }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return errorResponse(res, 400, 'OTP not found');
    }

    if (otpDoc.expiresAt < new Date()) {
      return errorResponse(res, 400, 'OTP expired');
    }

    if (otpDoc.otp !== String(otp)) {
      return errorResponse(res, 400, 'Invalid OTP');
    }

    await Otp.deleteMany({ user: user._id, type });

    if (type === 'EMAIL_VERIFICATION') {
      // ✅ FIX: Use existing field (your User model has `isVerified` or `confirmed`, NOT `emailVerified`)
      user.isVerified = true; // or user.confirmed = true;
      await user.save();
    }

    return successResponse(res, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // 🔒 Security: Don't reveal if email exists → still return success
      return successResponse(res, 'OTP sent for password reset');
    }

    await generateAndStoreOtp(user._id, email, 'RESET_PASSWORD');
    return successResponse(res, 'OTP sent for password reset');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const otpDoc = await Otp.findOne({ user: user._id, type: 'RESET_PASSWORD' }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return errorResponse(res, 400, 'OTP not found or expired');
    }

    if (otpDoc.otp !== String(otp)) { // ✅ Also fix here!
      return errorResponse(res, 400, 'Invalid OTP');
    }

    await Otp.deleteMany({ user: user._id, type: 'RESET_PASSWORD' });

    user.password = newPassword;
    await user.save();

    return successResponse(res, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};