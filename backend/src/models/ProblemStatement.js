import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  location: String,
  affectedPeople: String,
  evidence: String,
  alternatives: String,
  potentialImpact: String,
  suggestedSolution: String,
  researchStatus: { type: String, enum: ['Submitted', 'Under Review', 'In Research', 'Validated', 'Converted'], default: 'Submitted' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedBy: String,
  submittedByEmail: { type: String, lowercase: true, trim: true },
  rejectionReason: String
}, { timestamps: true });

problemSchema.index({ title: 'text', description: 'text', domain: 'text' });
export default mongoose.model('ProblemStatement', problemSchema);

