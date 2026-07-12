import { useState, useCallback } from 'react';
import { Truck, Wrench, Route, Users, Gauge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { reportApi, vehicleApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { StatCard, Card, PageHeader } from '../components/ui.jsx';
import { Select } from '../components/Modal.jsx';
import { percent, label } from '../lib/format.js';
import { VEHICLE_TYPES, REGIONS } from '../lib/constants.js';

const STATUS_COLORS = {
  available: '#0F6E56',
  on_trip: '#2775CA',
  in_shop: '#B45309',
  retired: '#78716C',
};

export default function Dashboard() {
  const [filters, setFilters] = useState({ type: '', status: '', region: '' });
  const fetchKpis = useCallback(() => reportApi.kpis(cleanParams(filters)), [filters]);
  const { data: kpis, loading } = useFetch(fetchKpis, [filters]);
  const { data: regionsData } = useFetch(() => vehicleApi.list(), []);

  const regions = [...new Set((regionsData || []).map((v) => v.region).filter(Boolean))];
  const donut = (kpis?.statusSplit || []).filter((s) => s.count > 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Fleet operations at a glance" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="w-40">
          <Select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">All types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {label(t)}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            {['available', 'on_trip', 'in_shop', 'retired'].map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}>
            <option value="">All regions</option>
            {(regions.length ? regions : REGIONS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading && !kpis ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Available vehicles" value={kpis.availableVehicles} icon={Truck}
              sub={`${kpis.totalVehicles} total in fleet`} />
            <StatCard label="In maintenance" value={kpis.inShopVehicles} icon={Wrench}
              accent="bg-amber-50 text-amber-700" />
            <StatCard label="Active trips" value={kpis.activeTrips} icon={Route}
              sub={`${kpis.draftTrips} draft pending`} />
            <StatCard label="Drivers on duty" value={kpis.driversOnDuty} icon={Users} />
            <StatCard label="Fleet utilization" value={percent(kpis.fleetUtilization)} icon={Gauge}
              accent="bg-brand-soft text-brand" sub="on-trip / non-retired" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink mb-3">Fleet status split</h3>
              {donut.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={donut} dataKey="count" nameKey="status" innerRadius={60} outerRadius={95} paddingAngle={2}>
                      {donut.map((d) => (
                        <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, label(n)]} />
                    <Legend formatter={(v) => label(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted py-8 text-center">No vehicles match these filters.</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink mb-3">Utilization</h3>
              <div className="flex flex-col items-center justify-center h-[260px]">
                <div className="font-display text-6xl text-brand tracking-tight">{percent(kpis.fleetUtilization)}</div>
                <p className="text-sm text-muted mt-2">of non-retired vehicles currently on a trip</p>
                <div className="w-full max-w-xs mt-6 h-2.5 rounded-full bg-hairline overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${Math.min(kpis.fleetUtilization, 100)}%` }} />
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
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
