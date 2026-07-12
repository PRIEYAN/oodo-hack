import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';
import ApiError, { asyncHandler } from '../utils/ApiError.js';
import { openMaintenance, closeMaintenance } from '../utils/statusMachine.js';

const populate = { path: 'vehicle', select: 'name registrationNumber status' };

export const list = asyncHandler(async (req, res) => {
  const { vehicle, status } = req.query;
  const filter = {};
  if (vehicle) filter.vehicle = vehicle;
  if (status) filter.status = status;
  const logs = await MaintenanceLog.find(filter).populate(populate).sort({ createdAt: -1 });
  res.json(logs);
});

// Opening maintenance sets the vehicle to in_shop (drops it from dispatch pool).
export const open = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, type, cost, description } = req.body;
  if (!vehicleId || !type) throw new ApiError(400, 'vehicle and type are required.');

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

  await openMaintenance(vehicle);
  const log = await MaintenanceLog.create({
    vehicle: vehicleId,
    type,
    cost: cost || 0,
    description,
    status: 'open',
    openedAt: new Date(),
  });
  await log.populate(populate);
  res.status(201).json(log);
});

// Closing maintenance returns the vehicle to available (unless retired).
export const close = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id);
  if (!log) throw new ApiError(404, 'Maintenance log not found.');
  if (log.status === 'closed') throw new ApiError(400, 'This maintenance log is already closed.');

  const vehicle = await Vehicle.findById(log.vehicle);
  if (vehicle) await closeMaintenance(vehicle);

  log.status = 'closed';
  log.closedAt = new Date();
  if (req.body.cost != null) log.cost = req.body.cost;
  await log.save();
  await log.populate(populate);
  res.json(log);
});
