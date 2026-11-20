import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  skills: [String],
  bio: String,
  image: String,
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  active: { type: Boolean, default: true },
  leadership: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('TeamMember', memberSchema);

