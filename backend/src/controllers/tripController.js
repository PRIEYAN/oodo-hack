import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import ApiError, { asyncHandler } from '../utils/ApiError.js';
import { dispatchTrip, completeTrip, cancelTrip } from '../utils/statusMachine.js';

const populate = [
  { path: 'vehicle', select: 'name registrationNumber maxLoadCapacity status type' },
  { path: 'driver', select: 'name licenseNumber status licenseExpiry' },
];

export const list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const trips = await Trip.find(filter).populate(populate).sort({ createdAt: -1 });
  res.json(trips);
});

// Create a draft trip. Runs ALL FIVE business validations up front.
export const create = asyncHandler(async (req, res) => {
  const { source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, plannedDistance, revenue } = req.body;
  if (!source || !destination || !vehicleId || !driverId)
    throw new ApiError(400, 'source, destination, vehicle and driver are required.');
  if (cargoWeight == null || plannedDistance == null)
    throw new ApiError(400, 'cargoWeight and plannedDistance are required.');

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  const driver = await Driver.findById(driverId);
  if (!driver) throw new ApiError(404, 'Driver not found.');

  // Rule #2: retired / in_shop vehicles cannot be dispatched.
  if (vehicle.status === 'retired')
    throw new ApiError(400, 'Vehicle is retired and cannot be assigned to a trip.');
  if (vehicle.status === 'in_shop')
    throw new ApiError(400, 'Vehicle is in the shop and cannot be assigned to a trip.');

  // Rule #4: no double-booking.
  if (vehicle.status === 'on_trip')
    throw new ApiError(400, 'Vehicle is already on a trip (double-booking not allowed).');
  if (driver.status === 'on_trip')
    throw new ApiError(400, 'Driver is already on a trip (double-booking not allowed).');

  // Rule #3: suspended driver or expired license cannot be assigned.
  if (driver.status === 'suspended')
    throw new ApiError(400, 'Driver is suspended and cannot be assigned to a trip.');
  if (driver.status === 'off_duty')
    throw new ApiError(400, 'Driver is off duty and cannot be assigned to a trip.');
  if (new Date(driver.licenseExpiry) < new Date())
    throw new ApiError(400, "Driver's license has expired and cannot be assigned to a trip.");

  // Rule #5: cargo must not exceed vehicle capacity.
  if (Number(cargoWeight) > vehicle.maxLoadCapacity)
    throw new ApiError(
      400,
      `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg).`
    );

  const trip = await Trip.create({
    source,
    destination,
    vehicle: vehicleId,
    driver: driverId,
    cargoWeight,
    plannedDistance,
    revenue: revenue || 0,
    status: 'draft',
  });
  await trip.populate(populate);
  res.status(201).json(trip);
});

async function loadTripWithRefs(id) {
  const trip = await Trip.findById(id);
  if (!trip) throw new ApiError(404, 'Trip not found.');
  const vehicle = await Vehicle.findById(trip.vehicle);
  const driver = await Driver.findById(trip.driver);
  return { trip, vehicle, driver };
}

export const dispatch = asyncHandler(async (req, res) => {
  const { trip, vehicle, driver } = await loadTripWithRefs(req.params.id);
  if (!vehicle || !driver) throw new ApiError(400, 'Assigned vehicle or driver no longer exists.');
  await dispatchTrip(trip, vehicle, driver);
  await trip.populate(populate);
  res.json(trip);
});

export const complete = asyncHandler(async (req, res) => {
  const { finalOdometer, fuelConsumed } = req.body;
  const { trip, vehicle, driver } = await loadTripWithRefs(req.params.id);
  if (!vehicle || !driver) throw new ApiError(400, 'Assigned vehicle or driver no longer exists.');
  await completeTrip(trip, vehicle, driver, { finalOdometer, fuelConsumed });
  await trip.populate(populate);
  res.json(trip);
});

export const cancel = asyncHandler(async (req, res) => {
  const { trip, vehicle, driver } = await loadTripWithRefs(req.params.id);
  await cancelTrip(trip, vehicle, driver);
  await trip.populate(populate);
  res.json(trip);
});
