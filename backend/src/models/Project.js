import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  completed: { type: Boolean, default: false }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, required: true },
  overview: String,
  problemStatement: String,
  whyItMatters: String,
  proposedSolution: String,
  keyFeatures: [String],
  targetAudience: [String],
  domain: { type: String, required: true },
  category: { type: String, required: true },
  technologyStack: [String],
  status: { type: String, enum: ['Idea', 'Problem Discovery', 'Research', 'Planning', 'Development', 'Testing', 'Completed', 'On Hold'], default: 'Idea' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }],
  thumbnail: String,
  images: [String],
  demoUrl: String,
  githubUrl: String,
  roadmap: [milestoneSchema],
  futureImprovements: [String],
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: false }
}, { timestamps: true });

projectSchema.index({ name: 'text', description: 'text', domain: 'text' });
export default mongoose.model('Project', projectSchema);

