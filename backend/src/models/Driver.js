import mongoose from 'mongoose';

export const DRIVER_STATUS = ['available', 'on_trip', 'off_duty', 'suspended'];

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, trim: true, default: 'B' },
    licenseExpiry: { type: Date, required: true },
    contactNumber: { type: String, trim: true },
    safetyScore: { type: Number, min: 0, max: 100, default: 100 },
    status: { type: String, enum: DRIVER_STATUS, default: 'available' },
  },
  { timestamps: true }
);

export default mongoose.model('Driver', driverSchema);
