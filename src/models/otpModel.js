import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
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

// automatically delete expired OTP docs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);
