// src/models/otpModel.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      index: true, // ← For fast lookup
    },
    phone: {
      type: String,
      index: true, // ← For fast lookup
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['LOGIN', 'RESET_PASSWORD', 'EMAIL_VERIFICATION'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);