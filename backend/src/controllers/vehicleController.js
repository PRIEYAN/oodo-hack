import Vehicle from '../models/Vehicle.js';
import ApiError, { asyncHandler } from '../utils/ApiError.js';

export const list = asyncHandler(async (req, res) => {
  const { type, status, region } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (region) filter.region = region;
  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
  res.json(vehicles);
});

// Only 'available' vehicles are assignable for dispatch. Retired / in_shop /
// on_trip vehicles never show up here (business rule #2 + #4).
export const available = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ status: 'available' }).sort({ name: 1 });
  res.json(vehicles);
});

export const create = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json(vehicle);
});

export const update = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  res.json(vehicle);
});

export const remove = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  if (vehicle.status === 'on_trip')
    throw new ApiError(400, 'Cannot delete a vehicle that is on a trip.');
  await vehicle.deleteOne();
  res.json({ success: true });
});
