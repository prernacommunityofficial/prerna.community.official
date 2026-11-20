import mongoose from 'mongoose';

const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  purpose: { type: String, enum: ['register', 'reset'], required: true },
  otpHash: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pendingPasswordHash: String,
  profile: mongoose.Schema.Types.Mixed,
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('EmailOtp', emailOtpSchema);
