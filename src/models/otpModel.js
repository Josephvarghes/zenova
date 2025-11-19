// // src/models/otpModel.js
// import mongoose from 'mongoose';

// const otpSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'users',
//       required: false, // ← Critical for security
//     },
//     email: {
//       type: String,
//       sparse: true,
//     },
//     identifier: { type: String, required: true },
//     phone: {
//       type: String,
//       sparse: true,
//     },
//     otp: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ['LOGIN', 'RESET_PASSWORD', 'EMAIL_VERIFICATION'],
//       required: true,
//     },
//     expiresAt: {
//       type: Date,
//       required: true,
//     },
//     verified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// // Auto-delete expired OTPs
// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// export default mongoose.model('Otp', otpSchema); 
// src/models/otpModel.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true, // ← MUST be required for security
  },
  email: { type: String, sparse: true },
  phone: { type: String, sparse: true },
  otp: { type: String, required: true },
  type: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('Otp', otpSchema);
