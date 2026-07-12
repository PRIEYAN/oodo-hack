import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Driver from './models/Driver.js';
import Trip from './models/Trip.js';
import MaintenanceLog from './models/MaintenanceLog.js';
import FuelLog from './models/FuelLog.js';
import Expense from './models/Expense.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected. Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Trip.deleteMany({}),
    MaintenanceLog.deleteMany({}),
    FuelLog.deleteMany({}),
    Expense.deleteMany({}),
  ]);

  // --- Users (one per role) ---
  const password = await bcrypt.hash('password123', 10);
  await User.create([
    { name: 'Fiona Manager', email: 'manager@transitops.dev', passwordHash: password, role: 'fleet_manager' },
    { name: 'Dave Dispatcher', email: 'dispatcher@transitops.dev', passwordHash: password, role: 'driver' },
    { name: 'Sam Safety', email: 'safety@transitops.dev', passwordHash: password, role: 'safety_officer' },
    { name: 'Fay Finance', email: 'finance@transitops.dev', passwordHash: password, role: 'financial_analyst' },
  ]);

  // --- Vehicles ---
  const vehicles = await Vehicle.create([
    { registrationNumber: 'VAN-05', name: 'Van 05', type: 'van', maxLoadCapacity: 500, odometer: 42000, acquisitionCost: 28000, region: 'North', status: 'available' },
    { registrationNumber: 'TRK-11', name: 'Truck 11', type: 'truck', maxLoadCapacity: 12000, odometer: 118000, acquisitionCost: 95000, region: 'North', status: 'available' },
    { registrationNumber: 'TRL-02', name: 'Trailer 02', type: 'trailer', maxLoadCapacity: 24000, odometer: 205000, acquisitionCost: 140000, region: 'South', status: 'available' },
    { registrationNumber: 'CAR-08', name: 'Car 08', type: 'car', maxLoadCapacity: 300, odometer: 61000, acquisitionCost: 22000, region: 'East', status: 'in_shop' },
    { registrationNumber: 'VAN-09', name: 'Van 09', type: 'van', maxLoadCapacity: 650, odometer: 8000, acquisitionCost: 31000, region: 'South', status: 'available' },
    { registrationNumber: 'TRK-20', name: 'Truck 20', type: 'truck', maxLoadCapacity: 15000, odometer: 260000, acquisitionCost: 88000, region: 'West', status: 'retired' },
  ]);
  const byReg = Object.fromEntries(vehicles.map((v) => [v.registrationNumber, v]));

  // --- Drivers ---
  const drivers = await Driver.create([
    { name: 'Alex Rivera', licenseNumber: 'DL-1001', category: 'C', licenseExpiry: daysFromNow(400), contactNumber: '555-0101', safetyScore: 92, status: 'available' },
    { name: 'Bianca Cole', licenseNumber: 'DL-1002', category: 'CE', licenseExpiry: daysFromNow(200), contactNumber: '555-0102', safetyScore: 88, status: 'available' },
    { name: 'Carl Ndlovu', licenseNumber: 'DL-1003', category: 'B', licenseExpiry: daysFromNow(-10), contactNumber: '555-0103', safetyScore: 70, status: 'available' }, // expired license
    { name: 'Dana Fischer', licenseNumber: 'DL-1004', category: 'C', licenseExpiry: daysFromNow(90), contactNumber: '555-0104', safetyScore: 45, status: 'suspended' },
    { name: 'Evan Park', licenseNumber: 'DL-1005', category: 'CE', licenseExpiry: daysFromNow(500), contactNumber: '555-0105', safetyScore: 96, status: 'available' },
  ]);
  const byLicense = Object.fromEntries(drivers.map((d) => [d.licenseNumber, d]));

  // --- A completed trip (feeds reports) ---
  await Trip.create({
    source: 'Depot A', destination: 'Warehouse B',
    vehicle: byReg['TRK-11']._id, driver: byLicense['DL-1005']._id,
    cargoWeight: 9000, plannedDistance: 320, finalOdometer: 118000, fuelConsumed: 85,
    revenue: 4200, status: 'completed',
  });
  // A draft trip ready to dispatch.
  await Trip.create({
    source: 'Depot A', destination: 'Port C',
    vehicle: byReg['TRL-02']._id, driver: byLicense['DL-1001']._id,
    cargoWeight: 18000, plannedDistance: 540, revenue: 6800, status: 'draft',
  });

  // --- Maintenance (open on CAR-08, matching its in_shop status) ---
  await MaintenanceLog.create({
    vehicle: byReg['CAR-08']._id, type: 'Brake Service', cost: 480,
    description: 'Front brake pads + rotor inspection', status: 'open', openedAt: daysFromNow(-2),
  });
  await MaintenanceLog.create({
    vehicle: byReg['TRK-11']._id, type: 'Oil Change', cost: 220,
    description: 'Routine oil + filter', status: 'closed', openedAt: daysFromNow(-30), closedAt: daysFromNow(-29),
  });

  // --- Fuel + expenses (feed operational cost) ---
  await FuelLog.create([
    { vehicle: byReg['TRK-11']._id, liters: 85, cost: 145, date: daysFromNow(-5), odometer: 118000 },
    { vehicle: byReg['VAN-05']._id, liters: 40, cost: 68, date: daysFromNow(-3), odometer: 42000 },
    { vehicle: byReg['TRL-02']._id, liters: 150, cost: 255, date: daysFromNow(-7), odometer: 205000 },
  ]);
  await Expense.create([
    { vehicle: byReg['TRK-11']._id, category: 'toll', amount: 60, date: daysFromNow(-5), note: 'Highway tolls' },
    { vehicle: byReg['TRL-02']._id, category: 'toll', amount: 120, date: daysFromNow(-7), note: 'Port access' },
    { vehicle: byReg['VAN-05']._id, category: 'other', amount: 35, date: daysFromNow(-3), note: 'Parking' },
  ]);

  console.log('✓ Seed complete.');
  console.log('  Logins (password: password123):');
  console.log('   manager@transitops.dev     (fleet_manager)');
  console.log('   dispatcher@transitops.dev  (driver / dispatcher)');
  console.log('   safety@transitops.dev      (safety_officer)');
  console.log('   finance@transitops.dev     (financial_analyst)');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
