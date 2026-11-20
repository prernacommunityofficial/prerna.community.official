import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  college: { type: String, required: true },
  course: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  state: { type: String, required: true },
  skills: [String],
  areasOfInterest: [String],
  preferredDepartment: { type: String, required: true },
  weeklyAvailability: { type: String, required: true },
  motivation: { type: String, required: true },
  linkedinUrl: String,
  githubUrl: String,
  resumeUrl: String,
  privacyConsent: { type: Boolean, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  internalNotes: String
}, { timestamps: true });

applicationSchema.index({ email: 1 });
export default mongoose.model('Application', applicationSchema);

