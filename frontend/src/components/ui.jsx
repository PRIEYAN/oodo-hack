import { label as fmtLabel } from '../lib/format.js';

// --- Button ---
export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-white text-ink border border-hairline hover:bg-bg',
    ghost: 'text-muted hover:text-ink hover:bg-bg',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  };
  const sizes = { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-3.5 py-2' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

// --- Card ---
export function Card({ className = '', children }) {
  return (
    <div className={`bg-surface border border-hairline rounded-card ${className}`}>{children}</div>
  );
}

// --- StatCard ---
export function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card className="p-5 hover:border-brand/30 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-eyebrow font-semibold text-muted">{label}</p>
        {Icon && (
          <span className={`p-1.5 rounded-control ${accent || 'bg-brand-soft text-brand'}`}>
            <Icon size={15} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-4xl leading-none tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-2 text-xs text-muted">{sub}</p>}
    </Card>
  );
}

// --- StatusPill ---
const PILL_STYLES = {
  available: 'bg-emerald-50 text-emerald-700',
  on_trip: 'bg-emerald-50 text-emerald-700',
  dispatched: 'bg-amber-50 text-amber-700',
  in_shop: 'bg-amber-50 text-amber-700',
  open: 'bg-amber-50 text-amber-700',
  draft: 'bg-brand-soft text-brand-dark',
  completed: 'bg-brand-soft text-brand-dark',
  closed: 'bg-slate-100 text-slate-600',
  expired: 'bg-red-50 text-red-600',
  suspended: 'bg-red-50 text-red-600',
  cancelled: 'bg-red-50 text-red-600',
  retired: 'bg-stone-100 text-stone-600',
  off_duty: 'bg-stone-100 text-stone-600',
};

export function StatusPill({ status }) {
  const cls = PILL_STYLES[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {fmtLabel(status)}
    </span>
  );
}

// --- Section header ---
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// --- Empty state ---
export function Empty({ message = 'Nothing here yet.' }) {
  return <div className="py-12 text-center text-sm text-muted">{message}</div>;
}
