import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  Bus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS, NAV_FOR_ROLE } from '../lib/rbac.js';

const NAV = [
  { key: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { key: 'vehicles', to: '/vehicles', label: 'Vehicles', icon: Truck },
  { key: 'drivers', to: '/drivers', label: 'Drivers', icon: Users },
  { key: 'trips', to: '/trips', label: 'Trips', icon: Route },
  { key: 'maintenance', to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'finance', to: '/finance', label: 'Fuel & Expenses', icon: Fuel },
  { key: 'reports', to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allowed = NAV_FOR_ROLE[user?.role] || [];
  const items = NAV.filter((n) => allowed.includes(n.key));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-hairline bg-surface flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-hairline">
          <span className="p-1.5 rounded-control bg-brand text-white">
            <Bus size={18} />
          </span>
          <span className="font-semibold text-ink">TransitOps</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((n) => (
            <NavLink
              key={n.key}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-control text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-soft text-brand-dark font-medium'
                    : 'text-muted hover:text-ink hover:bg-bg'
                }`
              }
            >
              <n.icon size={17} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-hairline">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[user?.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-control text-sm text-muted hover:text-ink hover:bg-bg"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 bg-bg">
        <div className="max-w-6xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
