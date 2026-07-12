import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';
import ApiError, { asyncHandler } from '../utils/ApiError.js';

const vehiclePopulate = { path: 'vehicle', select: 'name registrationNumber' };

// --- Fuel ---
export const listFuel = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  const logs = await FuelLog.find(filter).populate(vehiclePopulate).sort({ date: -1 });
  res.json(logs);
});

export const createFuel = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, liters, cost, date, odometer } = req.body;
  if (!vehicleId || liters == null || cost == null)
    throw new ApiError(400, 'vehicle, liters and cost are required.');
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  const log = await FuelLog.create({ vehicle: vehicleId, liters, cost, date, odometer });
  await log.populate(vehiclePopulate);
  res.status(201).json(log);
});

// --- Expenses ---
export const listExpenses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  const items = await Expense.find(filter).populate(vehiclePopulate).sort({ date: -1 });
  res.json(items);
});

export const createExpense = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, category, amount, date, note } = req.body;
  if (!vehicleId || amount == null)
    throw new ApiError(400, 'vehicle and amount are required.');
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  const item = await Expense.create({ vehicle: vehicleId, category, amount, date, note });
  await item.populate(vehiclePopulate);
  res.status(201).json(item);
});
