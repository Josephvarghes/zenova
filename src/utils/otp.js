// // utils/otp.js  (or utils/otpService.js — pick one name and stick to it)

// import Otp from '../models/otpModel.js';
// import { sendOtpEmail } from '~/services/emailService/index.js';

// // ✅ DEFINE generateOTP
// export const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString(); 
//   // 6-digit string
  
// };

// // ✅ DEFINE generateAndStoreOtp
// export const generateAndStoreOtp = async (userId, email, type) => {
//   const otp = generateOTP(); // ✅ Now defined!
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//   await Otp.deleteMany({ user: userId, type });
//   await Otp.create({ user: userId, otp, type, expiresAt });
//   await sendOtpEmail(email, otp, type);

//   return otp;
// }; 

// src/utils/otp.js





// import Otp from '../models/otpModel.js';
// import { sendOtpEmail } from '~/services/emailService/index.js';

// export const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit string
// };

// export const generateAndStoreOtp = async (userId, identifier, type) => {
//   const otp = generateOTP();
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//   // ✅ Save email/phone in OTP doc (critical for new users)
//   const otpDoc = new Otp({
//     user: userId || undefined, // null for new users
//     email: identifier.includes('@') ? identifier : undefined,
//     phone: identifier.includes('@') ? undefined : identifier,
//     otp,
//     type,
//     expiresAt,
//   });

//   await otpDoc.save();

//   // Send email only if email is provided
//   if (identifier.includes('@')) {
//     await sendOtpEmail(identifier, otp, type);
//   }

//   return otp;
// }; 

// src/utils/otp.js
import Otp from '../models/otpModel.js';
import { sendOtpEmail } from '~/services/emailService/index.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit string
};

export const generateAndStoreOtp = async (userId, identifier, type) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const otpDoc = new Otp({
    user: userId, // ← Critical: link to user
    email: identifier.includes('@') ? identifier : undefined,
    phone: identifier.includes('@') ? undefined : identifier,
    otp,
    type,
    expiresAt,
  });

  await otpDoc.save();

  if (identifier.includes('@')) {
    await sendOtpEmail(identifier, otp, type);
  }

  return otp;
}; 

