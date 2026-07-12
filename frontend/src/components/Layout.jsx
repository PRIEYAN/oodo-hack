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
  Search,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS, NAV_FOR_ROLE } from '../lib/rbac.js';
import { Logo } from './Logo.jsx';
import { useTheme } from '../hooks/useTheme.js';

const NAV = [
  { key: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { key: 'vehicles', to: '/vehicles', label: 'Vehicles', icon: Truck },
  { key: 'drivers', to: '/drivers', label: 'Drivers', icon: Users },
  { key: 'trips', to: '/trips', label: 'Trips', icon: Route },
  { key: 'maintenance', to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'finance', to: '/finance', label: 'Fuel & Expenses', icon: Fuel },
  { key: 'reports', to: '/reports', label: 'Reports', icon: BarChart3 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const allowed = NAV_FOR_ROLE[user?.role] || [];
  const items = NAV.filter((n) => allowed.includes(n.key));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-hairline bg-surface flex flex-col">
        <div className="px-5 py-[18px] border-b border-hairline">
          <Logo />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 eyebrow">Operations</p>
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
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-dark">
              {initials(user?.name) || 'U'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{ROLE_LABELS[user?.role]}</p>
            </div>
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
      <main className="flex-1 min-w-0 bg-bg flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 shrink-0 border-b border-hairline bg-surface/80 backdrop-blur">
          <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink leading-tight truncate">
                {greeting()}, {(user?.name || '').split(' ')[0] || 'there'}
              </p>
              <p className="text-xs text-muted">{today}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 h-9 w-64 px-3 rounded-control border border-hairline bg-bg text-muted">
                <Search size={15} />
                <input
                  placeholder="Search fleet, drivers, trips…"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                />
              </div>
              <button
                onClick={toggle}
                className="grid h-9 w-9 place-items-center rounded-control border border-hairline bg-surface text-muted hover:text-ink hover:bg-bg"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                className="relative grid h-9 w-9 place-items-center rounded-control border border-hairline bg-surface text-muted hover:text-ink hover:bg-bg"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand" />
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
                {initials(user?.name) || 'U'}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-content w-full mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
