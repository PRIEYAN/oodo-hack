import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import * as authC from '../controllers/authController.js';
import * as vehicleC from '../controllers/vehicleController.js';
import * as driverC from '../controllers/driverController.js';
import * as tripC from '../controllers/tripController.js';
import * as maintC from '../controllers/maintenanceController.js';
import * as fuelC from '../controllers/fuelExpenseController.js';
import * as reportC from '../controllers/reportController.js';

const router = Router();

// --- Auth ---
router.post('/auth/register', authC.register); // seed/admin only in practice
router.post('/auth/login', authC.login);
router.get('/auth/me', auth, authC.me);

// Everything below requires a valid token.
router.use(auth);

// --- Vehicles (CRUD = fleet_manager only; reads open to all roles) ---
router.get('/vehicles', vehicleC.list);
router.get('/vehicles/available', vehicleC.available);
router.post('/vehicles', requireRole('fleet_manager'), vehicleC.create);
router.put('/vehicles/:id', requireRole('fleet_manager'), vehicleC.update);
router.delete('/vehicles/:id', requireRole('fleet_manager'), vehicleC.remove);

// --- Drivers (CRUD = fleet_manager + safety_officer) ---
router.get('/drivers', driverC.list);
router.get('/drivers/available', driverC.available);
router.post('/drivers', requireRole('fleet_manager', 'safety_officer'), driverC.create);
router.put('/drivers/:id', requireRole('fleet_manager', 'safety_officer'), driverC.update);
router.delete('/drivers/:id', requireRole('fleet_manager', 'safety_officer'), driverC.remove);

// --- Trips (create/dispatch = driver role a.k.a. dispatcher) ---
router.get('/trips', tripC.list);
router.post('/trips', requireRole('driver'), tripC.create);
router.post('/trips/:id/dispatch', requireRole('driver'), tripC.dispatch);
router.post('/trips/:id/complete', requireRole('driver'), tripC.complete);
router.post('/trips/:id/cancel', requireRole('driver'), tripC.cancel);

// --- Maintenance (fleet_manager) ---
router.get('/maintenance', maintC.list);
router.post('/maintenance', requireRole('fleet_manager'), maintC.open);
router.post('/maintenance/:id/close', requireRole('fleet_manager'), maintC.close);

// --- Fuel + Expenses (fleet_manager, driver, financial_analyst) ---
const financeRoles = ['fleet_manager', 'driver', 'financial_analyst'];
router.get('/fuel', fuelC.listFuel);
router.post('/fuel', requireRole(...financeRoles), fuelC.createFuel);
router.get('/expenses', fuelC.listExpenses);
router.post('/expenses', requireRole(...financeRoles), fuelC.createExpense);

// --- Dashboard + Reports ---
router.get('/dashboard/kpis', reportC.kpis);
router.get('/reports', reportC.reports);
router.get('/reports/export.csv', reportC.exportCsv);

export default router;
