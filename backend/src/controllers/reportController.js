import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import { asyncHandler } from '../utils/ApiError.js';
import { toCsv } from '../utils/csv.js';

export const kpis = asyncHandler(async (req, res) => {
  const { type, status, region } = req.query;
  const match = {};
  if (type) match.type = type;
  if (status) match.status = status;
  if (region) match.region = region;

  const vehicles = await Vehicle.find(match);
  const totalVehicles = vehicles.length;
  const nonRetired = vehicles.filter((v) => v.status !== 'retired');
  const onTrip = vehicles.filter((v) => v.status === 'on_trip').length;
  const available = vehicles.filter((v) => v.status === 'available').length;
  const inShop = vehicles.filter((v) => v.status === 'in_shop').length;

  const driversOnDuty = await Driver.countDocuments({ status: { $in: ['available', 'on_trip'] } });
  const activeTrips = await Trip.countDocuments({ status: 'dispatched' });
  const draftTrips = await Trip.countDocuments({ status: 'draft' });

  const utilization = nonRetired.length ? (onTrip / nonRetired.length) * 100 : 0;

  // Status split for the donut chart.
  const statusSplit = ['available', 'on_trip', 'in_shop', 'retired'].map((s) => ({
    status: s,
    count: vehicles.filter((v) => v.status === s).length,
  }));

  res.json({
    totalVehicles,
    availableVehicles: available,
    onTripVehicles: onTrip,
    inShopVehicles: inShop,
    driversOnDuty,
    activeTrips,
    draftTrips,
    fleetUtilization: Math.round(utilization * 10) / 10,
    statusSplit,
  });
});

// Build the per-vehicle report rows: fuel efficiency, op cost, ROI.
async function buildReport() {
  const vehicles = await Vehicle.find().sort({ name: 1 });
  const rows = [];

  for (const v of vehicles) {
    const trips = await Trip.find({ vehicle: v._id, status: 'completed' });
    const fuelLogs = await FuelLog.find({ vehicle: v._id });
    const maintLogs = await MaintenanceLog.find({ vehicle: v._id });
    const expenses = await Expense.find({ vehicle: v._id });

    const distanceFromTrips = trips.reduce((sum, t) => sum + (t.plannedDistance || 0), 0);
    const litersFromTrips = trips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
    const litersFromLogs = fuelLogs.reduce((sum, f) => sum + (f.liters || 0), 0);
    const totalLiters = litersFromTrips + litersFromLogs;

    const fuelCost = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
    const maintCost = maintLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
    const expenseCost = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const revenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);

    const operationalCost = fuelCost + maintCost + expenseCost;
    const fuelEfficiency = totalLiters > 0 ? distanceFromTrips / totalLiters : 0;
    const roi = v.acquisitionCost > 0 ? (revenue - (maintCost + fuelCost)) / v.acquisitionCost : 0;

    rows.push({
      vehicleId: v._id,
      name: v.name,
      registrationNumber: v.registrationNumber,
      type: v.type,
      status: v.status,
      distanceTravelled: Math.round(distanceFromTrips),
      litersConsumed: Math.round(totalLiters * 10) / 10,
      fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
      fuelCost: Math.round(fuelCost),
      maintenanceCost: Math.round(maintCost),
      expenseCost: Math.round(expenseCost),
      operationalCost: Math.round(operationalCost),
      revenue: Math.round(revenue),
      roi: Math.round(roi * 100) / 100,
    });
  }
  return rows;
}

export const reports = asyncHandler(async (req, res) => {
  const rows = await buildReport();
  res.json(rows);
});

export const exportCsv = asyncHandler(async (req, res) => {
  const rows = await buildReport();
  const columns = [
    { key: 'name', label: 'Vehicle' },
    { key: 'registrationNumber', label: 'Reg Number' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'distanceTravelled', label: 'Distance (km)' },
    { key: 'litersConsumed', label: 'Fuel (L)' },
    { key: 'fuelEfficiency', label: 'Efficiency (km/L)' },
    { key: 'fuelCost', label: 'Fuel Cost' },
    { key: 'maintenanceCost', label: 'Maintenance Cost' },
    { key: 'expenseCost', label: 'Other Expenses' },
    { key: 'operationalCost', label: 'Operational Cost' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'roi', label: 'ROI' },
  ];
  const csv = toCsv(rows, columns);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transitops-report.csv"');
  res.send(csv);
});
