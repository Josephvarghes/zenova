import Otp from '../models/otpModel';
import User from '../models/userModel';
import { generateAndStoreOtp } from '../utils/otp.js';
import { sendOtpEmail } from '~/services/emailService/index.js'; 
import tokenService from '~/services/tokenService'; 

// Helper for consistent success response
const successResponse = (res, message, data = {}) => {
  return res.json({ success: true, data, message });
};

// Helper for consistent error response
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, data: {}, message });
};



// export const sendOtp = async (req, res, next) => {
//   try {
//     const { email, phone, type } = req.body;

//     console.log('🔍 sendOtp called with:', { email, phone, type });

//     if (!email && !phone) {
//       return errorResponse(res, 400, 'Email or phone is required');
//     }

//     let user = null;
//     if (email) {
//       user = await User.findOne({ email });
//       console.log('📧 User lookup by email:', email, '→', user ? 'FOUND' : 'NOT FOUND');
//     } else if (phone) {
//       user = await User.findOne({ phone });
//       console.log('📱 User lookup by phone:', phone, '→', user ? 'FOUND' : 'NOT FOUND');
//     }

//     const userId = user ? user._id : null;
//     console.log('🆔 Using userId:', userId);

//     await generateAndStoreOtp(userId, email || phone, type);
//     return successResponse(res, 'OTP sent successfully');
//   } catch (err) {
//     console.error('❌ sendOtp error:', err);
//     next(err);
//   }
// };

// src/controllers/otpController.js
// src/controllers/otpController.js
export const sendOtp = async (req, res, next) => {
  try {
    const { email, phone, type = 'LOGIN' } = req.body;

    if (!email && !phone) {
      return errorResponse(res, 400, 'Email or phone is required');
    }

    // Delete old OTPs
    await Otp.deleteMany({ $or: [{ email }, { phone }] });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP with email/phone (no user)
    await Otp.create({
      email,
      phone,
      otp,
      type,
      expiresAt,
    });

    // Send email
    if (email) {
      await sendOtpEmail(email, otp, type);
    }

    return successResponse(res, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;

    // Find OTP by email/phone
    const otpDoc = await Otp.findOne({
      $or: [{ email }, { phone }],
      otp,
      expiresAt: { $gte: new Date() },
      verified: false,
    });

    if (!otpDoc) {
      return errorResponse(res, 400, 'Invalid or expired OTP');
    }

    // Mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Find or create user
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    let isNewUser = false;
    if (!user) {
      user = new User({
        fullName: 'New User',
        userName: `user_${Date.now()}`,
        email: email || undefined,
        phone: phone || undefined,
        password: 'temp_password',
        confirmed: true,
        isVerified: true,
      });
      await user.save();
      isNewUser = true;
    }

    // Generate tokens
    const tokens = await tokenService.generateAuthTokens(user);

    return res.json({
      success: true,
       data:{
        userId: user._id,
        isNewUser,
        user: {
          id: user._id,
          fullName: user.fullName,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
        },
        tokens,
      },
      message: isNewUser 
        ? 'Account created. Complete onboarding.' 
        : 'Login successful.',
    });
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

// src/controllers/otpController.js
export const signupWithOtp = async (req, res, next) => {
  try {
    const { email, phone, otp, name } = req.body;

    // Validate
    if (!email && !phone) {
      return errorResponse(res, 400, 'Email or phone is required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists. Please log in.');
    }

    // Verify OTP
    const otpDoc = await Otp.findOne({ 
      $or: [{ email }, { phone }],
      otp,
      type: 'EMAIL_VERIFICATION',
      expiresAt: { $gte: new Date() }
    });

    if (!otpDoc) {
      return errorResponse(res, 400, 'Invalid or expired OTP');
    }

    // Create new user
    const newUser = new User({
      fullName: name || 'New User',
      userName: `user_${Date.now()}`,
      email: email || undefined,
      phone: phone || undefined,
      password: 'temp_password', // Will be updated in onboarding
      confirmed: true,
      isVerified: true,
    });

    const user = await newUser.save();

    // Delete OTP
    await Otp.deleteMany({ 
      $or: [{ email }, { phone }],
      type: 'EMAIL_VERIFICATION'
    });

    // ✅ Return userId for onboarding
    return res.json({
      success: true,
      data: {
        userId: user._id,
        isNewUser: true,
      },
      message: 'User created. Complete onboarding.',
    });
  } catch (err) {
    next(err);
  }
};