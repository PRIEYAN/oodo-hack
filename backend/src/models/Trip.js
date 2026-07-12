import mongoose from 'mongoose';

export const TRIP_STATUS = ['draft', 'dispatched', 'completed', 'cancelled'];

const tripSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeight: { type: Number, required: true, min: 0 },
    plannedDistance: { type: Number, required: true, min: 0 },
    finalOdometer: { type: Number, default: null },
    fuelConsumed: { type: Number, default: null },
    revenue: { type: Number, default: 0 },
    status: { type: String, enum: TRIP_STATUS, default: 'draft' },
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
