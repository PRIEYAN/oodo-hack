import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Wrench,
  Route,
  Users,
  Gauge,
  AlertTriangle,
  Contact,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { reportApi, vehicleApi, tripApi, driverApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { StatCard, Card, PageHeader, StatusPill } from '../components/ui.jsx';
import { RouteWatermark } from '../components/Logo.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { Select } from '../components/Modal.jsx';
import { percent, label, currency, number, date } from '../lib/format.js';
import { VEHICLE_TYPES, REGIONS } from '../lib/constants.js';

const STATUS_COLORS = {
  available: '#0F6E56',
  on_trip: '#2775CA',
  in_shop: '#B45309',
  retired: '#78716C',
};

const DAY = 86400000;

export default function Dashboard() {
  const { theme } = useTheme();
  const chartGrid = theme === 'dark' ? '#232735' : '#EEF1F5';
  const chartTick = theme === 'dark' ? '#94A3B8' : '#6B7280';
  const chartTooltip = theme === 'dark'
    ? { background: '#12151C', border: '1px solid #232735', borderRadius: 8, fontSize: 12, color: '#EDF0F5' }
    : { borderRadius: 8, border: '1px solid #E4E7EC', fontSize: 12 };
  const [filters, setFilters] = useState({ type: '', status: '', region: '' });
  const fetchKpis = useCallback(() => reportApi.kpis(cleanParams(filters)), [filters]);
  const { data: kpis, loading } = useFetch(fetchKpis, [filters]);
  const { data: vehicles } = useFetch(() => vehicleApi.list(), []);
  const { data: reportRows } = useFetch(() => reportApi.reports(), []);
  const { data: trips } = useFetch(() => tripApi.list(), []);
  const { data: drivers } = useFetch(() => driverApi.list(), []);

  const regions = [...new Set((vehicles || []).map((v) => v.region).filter(Boolean))];
  const donut = (kpis?.statusSplit || []).filter((s) => s.count > 0);

  // --- derived analytics -------------------------------------------------
  const rows = reportRows || [];
  const costData = [...rows]
    .filter((r) => r.operationalCost > 0)
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 6)
    .map((r) => ({ name: r.registrationNumber || r.name, cost: r.operationalCost }));

  const topRoi = [...rows]
    .filter((r) => r.revenue > 0 || r.roi !== 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  const activeTrips = (trips || [])
    .filter((t) => t.status === 'dispatched' || t.status === 'draft')
    .slice(0, 6);

  const now = Date.now();
  const alerts = [];
  (drivers || []).forEach((d) => {
    const exp = d.licenseExpiry ? new Date(d.licenseExpiry).getTime() : null;
    if (exp !== null && exp < now) {
      alerts.push({ kind: 'danger', icon: Contact, text: `${d.name}'s license expired`, meta: date(d.licenseExpiry) });
    } else if (exp !== null && exp - now < 30 * DAY) {
      alerts.push({ kind: 'warn', icon: Contact, text: `${d.name}'s license expires soon`, meta: date(d.licenseExpiry) });
    }
    if (d.status === 'suspended') {
      alerts.push({ kind: 'danger', icon: AlertTriangle, text: `${d.name} is suspended`, meta: 'Cannot be dispatched' });
    }
  });
  (vehicles || [])
    .filter((v) => v.status === 'in_shop')
    .forEach((v) => {
      alerts.push({ kind: 'warn', icon: Wrench, text: `${v.registrationNumber} in maintenance`, meta: v.name });
    });
  const shownAlerts = alerts.slice(0, 6);

  const totalOpCost = rows.reduce((s, r) => s + (r.operationalCost || 0), 0);
  const totalRevenue = rows.reduce((s, r) => s + (r.revenue || 0), 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Fleet operations at a glance">
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 rounded-control bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          <Route size={15} /> New trip
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="w-40">
          <Select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">All types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{label(t)}</option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            {['available', 'on_trip', 'in_shop', 'retired'].map((s) => (
              <option key={s} value={s}>{label(s)}</option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}>
            <option value="">All regions</option>
            {(regions.length ? regions : REGIONS).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
      </div>

      {loading && !kpis ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          {/* Hero summary band */}
          <div className="rounded-card bg-navy text-white p-6 mb-5 overflow-hidden relative">
            <RouteWatermark className="absolute -right-20 -top-20 w-96 h-96 text-brand/20" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-6 items-center">
              <div>
                <p className="eyebrow !text-brand-soft/70">Fleet utilization</p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="font-display text-6xl leading-none tracking-tight">
                    {percent(kpis.fleetUtilization)}
                  </span>
                  <span className="mb-2 text-sm text-white/60">of non-retired fleet on a trip</span>
                </div>
                <div className="mt-4 h-2 w-full max-w-md rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${Math.min(kpis.fleetUtilization, 100)}%` }}
                  />
                </div>
              </div>
              <HeroStat label="Vehicles on trip" value={number(kpis.onTripVehicles)} sub={`${number(kpis.totalVehicles)} in fleet`} />
              <HeroStat label="Revenue booked" value={currency(totalRevenue)} sub={`${currency(totalOpCost)} op cost`} />
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Available vehicles" value={kpis.availableVehicles} icon={Truck}
              sub={`${kpis.totalVehicles} total in fleet`} />
            <StatCard label="In maintenance" value={kpis.inShopVehicles} icon={Wrench}
              accent="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" />
            <StatCard label="Active trips" value={kpis.activeTrips} icon={Route}
              sub={`${kpis.draftTrips} draft pending`} />
            <StatCard label="Drivers on duty" value={kpis.driversOnDuty} icon={Users} />
            <StatCard label="Open alerts" value={alerts.length} icon={AlertTriangle}
              accent={alerts.length
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}
              sub={alerts.length ? 'Needs attention' : 'All clear'} />
          </div>

          {/* Analytics row */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mt-5">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-ink">Operational cost by vehicle</h3>
                <Link to="/reports" className="text-xs text-brand hover:underline inline-flex items-center gap-1">
                  Reports <ArrowUpRight size={13} />
                </Link>
              </div>
              {costData.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={costData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartTick }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: chartTick }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip formatter={(v) => currency(v)} cursor={{ fill: chartGrid }}
                      contentStyle={chartTooltip} />
                    <Bar dataKey="cost" fill="#2775CA" radius={[5, 5, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted py-10 text-center">No cost data yet. Log fuel or maintenance to populate.</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink mb-3">Fleet status split</h3>
              {donut.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={donut} dataKey="count" nameKey="status" innerRadius={58} outerRadius={92} paddingAngle={2}>
                      {donut.map((d) => (
                        <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, label(n)]} />
                    <Legend formatter={(v) => label(v)} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted py-10 text-center">No vehicles match these filters.</p>
              )}
            </Card>
          </div>

          {/* Ops row: active trips + alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mt-5">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-ink">Active trips</h3>
                <Link to="/trips" className="text-xs text-brand hover:underline inline-flex items-center gap-1">
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>
              {activeTrips.length ? (
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-left text-xs text-muted border-b border-hairline">
                      <th className="font-normal py-2">Route</th>
                      <th className="font-normal">Vehicle</th>
                      <th className="font-normal">Driver</th>
                      <th className="font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrips.map((t) => (
                      <tr key={t._id} className="border-b border-hairline last:border-0">
                        <td className="py-2.5 font-medium text-ink">{t.source} → {t.destination}</td>
                        <td className="text-muted">{t.vehicle?.registrationNumber || '—'}</td>
                        <td className="text-muted">{t.driver?.name || '—'}</td>
                        <td className="text-right"><StatusPill status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-muted py-10 text-center">No active trips right now.</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink mb-3">Alerts &amp; compliance</h3>
              {shownAlerts.length ? (
                <ul className="space-y-2.5">
                  {shownAlerts.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-control ${
                        a.kind === 'danger'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        <a.icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-ink leading-tight">{a.text}</p>
                        <p className="text-xs text-muted">{a.meta}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">All clear</p>
                  <p className="text-xs text-muted mt-1">No expiring licenses or blocked assets.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Top ROI leaderboard */}
          {topRoi.length > 0 && (
            <Card className="p-5 mt-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-brand" />
                <h3 className="text-sm font-medium text-ink">Top performers by ROI</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {topRoi.map((r, i) => (
                  <div key={r.vehicleId} className="rounded-control border border-hairline p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">#{i + 1}</span>
                      <span className={`text-xs font-medium ${r.roi >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {r.roi >= 0 ? '+' : ''}{(r.roi * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink truncate">{r.registrationNumber}</p>
                    <p className="text-xs text-muted truncate">{currency(r.revenue)} revenue</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function HeroStat({ label, value, sub }) {
  return (
    <div className="border-l border-white/15 pl-6">
      <p className="eyebrow !text-brand-soft/70">{label}</p>
      <p className="mt-1 font-display text-3xl tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/50 mt-1">{sub}</p>}
    </div>
  );
}

function cleanParams(f) {
  const out = {};
  Object.entries(f).forEach(([k, v]) => {
    if (v) out[k] = v;
  });
  return out;
}
