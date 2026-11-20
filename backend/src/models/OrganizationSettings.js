import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  organizationName: { type: String, default: 'PRERNA – The Innovation Collective' },
  tagline: { type: String, default: 'Ideas into Innovation. Together.' },
  description: String,
  contactEmail: String,
  logoUrl: String,
  socialLinks: {
    linkedin: String,
    instagram: String,
    github: String,
    youtube: String
  },
  seo: {
    title: String,
    description: String,
    ogImage: String
  },
  homepageStats: {
    communityMembers: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    collaborations: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('OrganizationSettings', settingsSchema);
