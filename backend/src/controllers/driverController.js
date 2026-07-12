import Driver from '../models/Driver.js';
import ApiError, { asyncHandler } from '../utils/ApiError.js';

export const list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const drivers = await Driver.find(filter).sort({ createdAt: -1 });
  res.json(drivers);
});

// Assignable = available status + valid (non-expired) license + not suspended.
// (business rule #3 + #4)
export const available = asyncHandler(async (req, res) => {
  const drivers = await Driver.find({
    status: 'available',
    licenseExpiry: { $gte: new Date() },
  }).sort({ name: 1 });
  res.json(drivers);
});

export const create = asyncHandler(async (req, res) => {
  const driver = await Driver.create(req.body);
  res.status(201).json(driver);
});

export const update = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!driver) throw new ApiError(404, 'Driver not found.');
  res.json(driver);
});

export const remove = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new ApiError(404, 'Driver not found.');
  if (driver.status === 'on_trip')
    throw new ApiError(400, 'Cannot delete a driver that is on a trip.');
  await driver.deleteOne();
  res.json({ success: true });
});
