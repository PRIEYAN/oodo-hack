import mongoose from 'mongoose';

export const MAINTENANCE_STATUS = ['open', 'closed'];

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, required: true, trim: true },
    cost: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    status: { type: String, enum: MAINTENANCE_STATUS, default: 'open' },
  },
  { timestamps: true }
);

export default mongoose.model('MaintenanceLog', maintenanceSchema);
