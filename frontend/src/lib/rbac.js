// Mirrors the backend permission matrix. The server is the real gate; this just
// hides/disables controls the user can't use.

export const ROLE_LABELS = {
  fleet_manager: 'Fleet Manager',
  driver: 'Dispatcher (Driver)',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};

const CAN = {
  vehicles_write: ['fleet_manager'],
  drivers_write: ['fleet_manager', 'safety_officer'],
  trips_write: ['driver'],
  maintenance_write: ['fleet_manager'],
  finance_write: ['fleet_manager', 'driver', 'financial_analyst'],
};

export function can(role, action) {
  return (CAN[action] || []).includes(role);
}

// Which nav items a role should see (everyone can read most things).
export const NAV_FOR_ROLE = {
  fleet_manager: ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'finance', 'reports'],
  driver: ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'finance', 'reports'],
  safety_officer: ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'reports'],
  financial_analyst: ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'finance', 'reports'],
};
