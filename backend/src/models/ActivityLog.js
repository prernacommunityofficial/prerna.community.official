import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: String,
  details: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('ActivityLog', activitySchema);

