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

//     if (!email && !phone) {
//       return errorResponse(res, 400, 'Email or phone is required');
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return errorResponse(res, 404, 'User not found');
//     } 
    
//     await generateAndStoreOtp(user._id, email, type);
//     return successResponse(res, 'OTP sent successfully');
//   } catch (err) {
//     next(err);
//   }
// }; 

// export const sendOtp = async (req, res, next) => {
//   try {
//     const { email, phone, type } = req.body;

//     if (!email && !phone) {
//       return errorResponse(res, 400, 'Email or phone is required');
//     }

//     // ✅ Try to find user — but don't fail if not found
//     let user = null;
//     if (email) {
//       user = await User.findOne({ email });
//     } else if (phone) {
//       user = await User.findOne({ phone });
//     }

//     // ✅ If user exists, use user._id
//     // ✅ If user doesn't exist, pass null (for signup flow)
//     const userId = user ? user._id : null;

//     await generateAndStoreOtp(userId, email || phone, type);
//     return successResponse(res, 'OTP sent successfully');
//   } catch (err) {
//     next(err);
//   }
// };


export const sendOtp = async (req, res, next) => {
  try {
    const { email, phone, type } = req.body;

    console.log('🔍 sendOtp called with:', { email, phone, type });

    if (!email && !phone) {
      return errorResponse(res, 400, 'Email or phone is required');
    }

    let user = null;
    if (email) {
      user = await User.findOne({ email });
      console.log('📧 User lookup by email:', email, '→', user ? 'FOUND' : 'NOT FOUND');
    } else if (phone) {
      user = await User.findOne({ phone });
      console.log('📱 User lookup by phone:', phone, '→', user ? 'FOUND' : 'NOT FOUND');
    }

    const userId = user ? user._id : null;
    console.log('🆔 Using userId:', userId);

    await generateAndStoreOtp(userId, email || phone, type);
    return successResponse(res, 'OTP sent successfully');
  } catch (err) {
    console.error('❌ sendOtp error:', err);
    next(err);
  }
};


// export const verifyOtp = async (req, res, next) => {
//   try {
//     const { email, otp, type } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return errorResponse(res, 404, 'User not found');
//     }

//     const otpDoc = await Otp.findOne({ user: user._id, type }).sort({ createdAt: -1 });

//     if (!otpDoc) {
//       return errorResponse(res, 400, 'OTP not found');
//     }

//     if (otpDoc.expiresAt < new Date()) {
//       return errorResponse(res, 400, 'OTP expired');
//     }

//     if (otpDoc.otp !== String(otp)) {
//       return errorResponse(res, 400, 'Invalid OTP');
//     }

//     await Otp.deleteMany({ user: user._id, type });

//     if (type === 'EMAIL_VERIFICATION') {
//       // ✅ FIX: Use existing field (your User model has `isVerified` or `confirmed`, NOT `emailVerified`)
//       user.isVerified = true; // or user.confirmed = true;
//       await user.save();
//     }
//     const tokens = await tokenService.generateAuthTokens(user); 
    

//      return res.json({
//       success: true,
//       data: { user, tokens },
//       message: 'OTP verified successfully',
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// src/controllers/otpController.js
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, otp, type } = req.body;

    if ((!email && !phone) || !otp || !type) {
      return errorResponse(res, 400, 'Email/phone, OTP, and type are required');
    }

    // Find OTP by email/phone (not user ID)
    const otpDoc = await Otp.findOne({
      $or: [{ email }, { phone }],
      type,
      otp,
      expiresAt: { $gte: new Date() }
    });

    if (!otpDoc) {
      return errorResponse(res, 400, 'Invalid or expired OTP');
    }

    // Find or create user
    let user = null;
    let isNewUser = false;

    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

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

      // Link OTP to user
      otpDoc.user = user._id;
      await otpDoc.save();
    }

    if (type === 'EMAIL_VERIFICATION' && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const tokens = await tokenService.generateAuthTokens(user);
    await Otp.deleteMany({ $or: [{ email }, { phone }], type });

    return res.json({
      success: true,
      data: {
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