import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  enquiryType: { type: String, enum: ['General', 'Collaboration', 'Mentorship'], default: 'General' },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('ContactMessage', contactSchema);

