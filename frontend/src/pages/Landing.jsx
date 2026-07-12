import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bus,
  ShieldCheck,
  Route as RouteIcon,
  Truck,
  Users,
  Wrench,
  BarChart3,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

const RULES = [
  { t: 'Unique registration numbers', d: 'Duplicate plates are rejected at the database and the controller — bad data never lands.' },
  { t: 'Retired & in-shop vehicles are un-dispatchable', d: 'The dispatch pool only ever shows vehicles that are genuinely available.' },
  { t: 'Expired licenses & suspended drivers blocked', d: 'A driver with a lapsed license or a suspension can never be assigned to a trip.' },
  { t: 'No double-booking', d: 'A vehicle or driver already on a trip cannot be assigned to a second one.' },
  { t: 'Cargo never exceeds capacity', d: 'Overloading is impossible — the load is checked against the vehicle before dispatch.' },
];

const ROLES = [
  { name: 'Fleet Manager', icon: Truck, d: 'Full control of vehicles, maintenance and the books.' },
  { name: 'Dispatcher', icon: RouteIcon, d: 'Creates trips and runs the dispatch → complete lifecycle.' },
  { name: 'Safety Officer', icon: ShieldCheck, d: 'Owns the driver roster, licensing and suspensions.' },
  { name: 'Financial Analyst', icon: BarChart3, d: 'Reads reports, logs fuel & expenses, tracks ROI.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Nav />
      <Hero />
      <StatBand />
      <Features />
      <RulesSection />
      <RolesSection />
      <FooterCta />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur border-b border-hairline">
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-md bg-brand text-white">
            <Bus size={17} />
          </span>
          <span className="font-semibold tracking-tight text-[15px]">TransitOps</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          <a href="#platform" className="hover:text-ink transition-colors">Platform</a>
          <a href="#rules" className="hover:text-ink transition-colors">Rules engine</a>
          <a href="#roles" className="hover:text-ink transition-colors">Roles</a>
        </nav>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-4 py-2 rounded-control hover:bg-brand-dark transition-colors"
        >
          Get started <ArrowRight size={15} />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-70" />
      <div className="relative max-w-content mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="eyebrow mb-5">Smart transport operations</p>
          <h1 className="display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.98]">
            Run the fleet.
            <br />
            Break <span className="text-brand italic">no</span> rules.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-md leading-relaxed">
            TransitOps digitizes vehicles, drivers, trips and costs — and enforces every
            operating rule <span className="text-ink font-medium">server-side</span>, so bad
            data becomes impossible.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-5 py-3 rounded-control hover:bg-brand-dark transition-colors"
            >
              Get started <ArrowRight size={16} />
            </Link>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 border border-hairline text-sm font-medium px-5 py-3 rounded-control hover:bg-bg transition-colors"
            >
              See how it works
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 size={15} className="text-brand" />
            Four roles · RBAC · full trip lifecycle
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

// A stylized "dispatch board" product visual with a floating trip card.
function HeroVisual() {
  return (
    <div className="relative">
      <div className="border border-hairline rounded-card bg-surface shadow-[0_20px_60px_-30px_rgba(11,18,32,0.35)] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 h-10 border-b border-hairline">
          <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
          <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
          <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
          <span className="ml-3 text-xs text-muted">transitops · dispatch</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { l: 'Available', v: '4' },
              { l: 'On trip', v: '1' },
              { l: 'Utilization', v: '20%' },
            ].map((s) => (
              <div key={s.l} className="border border-hairline rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-eyebrow text-muted">{s.l}</div>
                <div className="display text-2xl mt-1">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { r: 'Depot A → Port C', s: 'dispatched', c: 'bg-amber-50 text-amber-700' },
              { r: 'Depot A → Warehouse B', s: 'completed', c: 'bg-brand-soft text-brand-dark' },
              { r: 'Yard → North Hub', s: 'draft', c: 'bg-slate-100 text-slate-600' },
            ].map((t) => (
              <div key={t.r} className="flex items-center justify-between border border-hairline rounded-lg px-3 py-2.5">
                <span className="text-sm font-medium">{t.r}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${t.c}`}>{t.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* floating rule-enforced chip */}
      <div className="absolute -bottom-5 -left-5 bg-navy text-white rounded-card px-4 py-3 shadow-xl hidden sm:block">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand" />
          <span className="text-sm font-medium">Cargo 450 ≤ 500 kg</span>
        </div>
        <div className="text-[11px] text-white/60 mt-0.5">Validated before dispatch</div>
      </div>
    </div>
  );
}

function StatBand() {
  const stats = [
    { n: '5', l: 'Business rules enforced' },
    { n: '4', l: 'Roles with scoped access' },
    { n: '0', l: 'Bad records possible' },
    { n: '100%', l: 'Server-side validation' },
  ];
  return (
    <section className="bg-navy text-white">
      <div className="max-w-content mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
        {stats.map((s) => (
          <div key={s.l} className="border-t border-white/15 pt-5">
            <div className="display text-[clamp(2.4rem,5vw,3.4rem)] leading-none">{s.n}</div>
            <div className="mt-3 text-[11px] uppercase tracking-eyebrow text-white/55">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Truck,
      t: 'A fleet that keeps itself honest',
      d: 'Register vehicles and drivers once. Unique keys, license validity and status transitions are enforced automatically — no spreadsheet drift.',
    },
    {
      icon: RouteIcon,
      t: 'Dispatch with guardrails',
      d: 'Create a trip and every rule runs before it saves: capacity, licensing, availability, double-booking. Dispatch and completion move vehicle & driver state in lock-step.',
    },
    {
      icon: BarChart3,
      t: 'Costs and ROI, computed',
      d: 'Fuel, maintenance and expenses roll up into operational cost, fuel efficiency and vehicle ROI — with one-click CSV export for the finance team.',
    },
  ];
  return (
    <section id="platform" className="max-w-content mx-auto px-6 py-24">
      <div className="max-w-2xl mb-14">
        <p className="eyebrow mb-4">The platform</p>
        <h2 className="display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.02]">
          One system for the whole operation.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-px bg-hairline border border-hairline rounded-card overflow-hidden">
        {items.map((it, i) => (
          <div key={it.t} className="bg-surface p-8">
            <div className="display text-3xl text-muted/50">0{i + 1}</div>
            <div className="mt-6 w-10 h-10 grid place-items-center rounded-lg bg-brand-soft text-brand">
              <it.icon size={19} />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{it.t}</h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RulesSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="rules" className="bg-bg border-y border-hairline">
      <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14">
        <div>
          <p className="eyebrow mb-4">The rules engine</p>
          <h2 className="display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.02]">
            Guardrails you can’t click past.
          </h2>
          <p className="mt-6 text-muted leading-relaxed max-w-md">
            The frontend mirrors them, but the server is the real gate. Every violation
            returns a clear message — surfaced instantly as a toast in the app.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 border border-hairline bg-surface rounded-control px-4 py-2.5 text-sm">
            <ShieldCheck size={16} className="text-brand" />
            Enforced in <span className="font-medium">controllers + a shared state machine</span>
          </div>
        </div>

        <div className="divide-y divide-hairline border-t border-b border-hairline">
          {RULES.map((r, i) => {
            const isOpen = open === i;
            return (
              <button
                key={r.t}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full text-left py-5 flex gap-4 group"
              >
                <span className="mt-0.5 text-brand shrink-0">
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </span>
                <span className="flex-1">
                  <span className="block font-medium group-hover:text-brand transition-colors">
                    {r.t}
                  </span>
                  {isOpen && <span className="block mt-2 text-sm text-muted leading-relaxed">{r.d}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section id="roles" className="max-w-content mx-auto px-6 py-24">
      <div className="max-w-2xl mb-14">
        <p className="eyebrow mb-4">Role-based access</p>
        <h2 className="display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.02]">
          Everyone sees exactly their lane.
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((r) => (
          <div key={r.name} className="border border-hairline rounded-card p-6 hover:border-brand/40 transition-colors">
            <div className="w-10 h-10 grid place-items-center rounded-lg bg-navy text-white">
              <r.icon size={18} />
            </div>
            <h3 className="mt-5 font-semibold tracking-tight">{r.name}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{r.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterCta() {
  return (
    <section className="bg-navy text-white">
      <div className="max-w-content mx-auto px-6 py-24 text-center">
        <p className="eyebrow text-white/50 mb-5">Ready when you are</p>
        <h2 className="display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.03] max-w-2xl mx-auto">
          Put the whole fleet on rails.
        </h2>
        <div className="mt-9 flex justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-6 py-3 rounded-control hover:bg-brand-dark transition-colors"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-6 h-6 rounded bg-brand text-white">
              <Bus size={13} />
            </span>
            TransitOps
          </div>
          <span>Smart Transport Operations Platform</span>
        </div>
      </div>
    </section>
  );
}
