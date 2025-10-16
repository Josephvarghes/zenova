// utils/otp.js  (or utils/otpService.js — pick one name and stick to it)

import Otp from '../models/otpModel.js';
import { sendOtpEmail } from '~/services/emailService/index.js';

// ✅ DEFINE generateOTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
  // 6-digit string
  
};

// ✅ DEFINE generateAndStoreOtp
export const generateAndStoreOtp = async (userId, email, type) => {
  const otp = generateOTP(); // ✅ Now defined!
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deleteMany({ user: userId, type });
  await Otp.create({ user: userId, otp, type, expiresAt });
  await sendOtpEmail(email, otp, type);

  return otp;
};