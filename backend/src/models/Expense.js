import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = ['toll', 'maintenance', 'other'];

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: 'other' },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
