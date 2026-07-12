import mongoose from 'mongoose';

export const VEHICLE_STATUS = ['available', 'on_trip', 'in_shop', 'retired'];
export const VEHICLE_TYPES = ['van', 'truck', 'trailer', 'car'];

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: VEHICLE_TYPES, required: true },
    maxLoadCapacity: { type: Number, required: true, min: 0 },
    odometer: { type: Number, default: 0, min: 0 },
    acquisitionCost: { type: Number, default: 0, min: 0 },
    region: { type: String, trim: true, default: 'Unassigned' },
    status: { type: String, enum: VEHICLE_STATUS, default: 'available' },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
