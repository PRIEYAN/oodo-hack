import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    liters: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    odometer: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('FuelLog', fuelSchema);
