// src/models/otpModel.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: false, // ← MUST be false for new users
    },
    email: {
      type: String,
      sparse: true, // ← Allow null/missing
    },
    phone: {
      type: String,
      sparse: true, // ← Allow null/missing
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String, // 'RESET_PASSWORD', 'EMAIL_VERIFICATION'
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Add indexes for email/phone lookup
otpSchema.index({ email: 1 });
otpSchema.index({ phone: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);