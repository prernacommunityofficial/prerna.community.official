import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false, minlength: 8 },
  emailVerified: { type: Boolean, default: false },
  phone: String,
  college: String,
  course: String,
  yearOfStudy: String,
  state: String,
  skills: [String],
  areasOfInterest: [String],
  preferredDepartment: String,
  weeklyAvailability: String,
  bio: String,
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  avatarUrl: String,
  resumeUrl: String,
  privacyConsent: { type: Boolean, default: false },
  notificationSettings: {
    projectUpdates: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
    communityNews: { type: Boolean, default: true }
  },
  accountSettings: {
    profileVisibility: { type: String, enum: ['public', 'community', 'private'], default: 'community' },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  active: { type: Boolean, default: true },
  source: { type: String, enum: ['application', 'member', 'community'], default: 'community'}
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
