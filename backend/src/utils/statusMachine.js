// Central place for every status transition so vehicle/driver/trip state never
// desyncs. Standalone MongoDB has no multi-doc transactions, so we use careful
// sequential writes and re-fetch state defensively inside controllers.

import ApiError from './ApiError.js';

// Allowed trip transitions.
const TRIP_TRANSITIONS = {
  draft: ['dispatched', 'cancelled'],
  dispatched: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function assertTripTransition(from, to) {
  const allowed = TRIP_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new ApiError(400, `Cannot move trip from ${from} to ${to}.`);
  }
}

// --- Trip lifecycle helpers. Each returns nothing; they mutate + save docs. ---

// draft -> dispatched : vehicle + driver become on_trip.
export async function dispatchTrip(trip, vehicle, driver) {
  assertTripTransition(trip.status, 'dispatched');
  if (vehicle.status === 'on_trip') throw new ApiError(400, 'Vehicle is already on a trip.');
  if (driver.status === 'on_trip') throw new ApiError(400, 'Driver is already on a trip.');
  if (vehicle.status !== 'available')
    throw new ApiError(400, `Vehicle is ${vehicle.status}, not available for dispatch.`);
  if (driver.status !== 'available')
    throw new ApiError(400, `Driver is ${driver.status}, not available for dispatch.`);

  vehicle.status = 'on_trip';
  driver.status = 'on_trip';
  trip.status = 'dispatched';
  await vehicle.save();
  await driver.save();
  await trip.save();
}

// dispatched -> completed : vehicle + driver back to available, odometer updated.
export async function completeTrip(trip, vehicle, driver, { finalOdometer, fuelConsumed }) {
  assertTripTransition(trip.status, 'completed');
  if (finalOdometer == null || fuelConsumed == null)
    throw new ApiError(400, 'finalOdometer and fuelConsumed are required to complete a trip.');
  if (Number(finalOdometer) < vehicle.odometer)
    throw new ApiError(400, `Final odometer (${finalOdometer}) cannot be less than current (${vehicle.odometer}).`);

  trip.finalOdometer = Number(finalOdometer);
  trip.fuelConsumed = Number(fuelConsumed);
  trip.status = 'completed';

  vehicle.odometer = Number(finalOdometer);
  vehicle.status = 'available';
  driver.status = 'available';

  await vehicle.save();
  await driver.save();
  await trip.save();
}

// dispatched -> cancelled : restore vehicle + driver to available.
// draft -> cancelled : nothing to restore (never dispatched).
export async function cancelTrip(trip, vehicle, driver) {
  const wasDispatched = trip.status === 'dispatched';
  assertTripTransition(trip.status, 'cancelled');
  trip.status = 'cancelled';
  await trip.save();
  if (wasDispatched) {
    if (vehicle && vehicle.status === 'on_trip') {
      vehicle.status = 'available';
      await vehicle.save();
    }
    if (driver && driver.status === 'on_trip') {
      driver.status = 'available';
      await driver.save();
    }
  }
}

// --- Maintenance lifecycle ---

// Open maintenance : vehicle -> in_shop.
export async function openMaintenance(vehicle) {
  if (vehicle.status === 'on_trip')
    throw new ApiError(400, 'Cannot open maintenance while the vehicle is on a trip.');
  if (vehicle.status === 'retired')
    throw new ApiError(400, 'Cannot open maintenance on a retired vehicle.');
  vehicle.status = 'in_shop';
  await vehicle.save();
}

// Close maintenance : vehicle -> available (unless retired).
export async function closeMaintenance(vehicle) {
  if (vehicle.status !== 'retired') {
    vehicle.status = 'available';
    await vehicle.save();
  }
}
