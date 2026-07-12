import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Route as RouteIcon,
  Truck,
  Users,
  Wrench,
  BarChart3,
  Fuel,
  Plus,
  Minus,
  Check,
  Gauge,
  MapPin,
} from 'lucide-react';
import { LogoMark } from '../components/Logo.jsx';
import logoUrl from '../assets/logo.png';

/*
  Landing page styled after claude.com/product/claude-science:
  warm ivory canvas, serif display headlines, black pill CTAs, alternating
  feature pillars, tabbed use-cases, testimonials, FAQ accordion and a large
  multi-column footer — carrying TransitOps content.

  Palette is kept local (arbitrary values) so the app's own theme tokens are
  untouched. Accent = TransitOps blue (matches the logo); primary buttons use
  Claude-style near-black.
*/

const INK = 'text-[#1A1815]';
const MUTED = 'text-[#6B6560]';
const CANVAS = 'bg-[#F5F1E9]';
const CARD = 'bg-[#FBF9F4]';
const LINE = 'border-[#E4DDCE]';
const BTN_DARK =
  'inline-flex items-center gap-2 rounded-full bg-[#1A1815] text-[#F5F1E9] text-sm font-medium px-5 py-2.5 hover:bg-[#33302A] transition-colors';
const BTN_LINE =
  'inline-flex items-center gap-2 rounded-full border border-[#CFC6B4] text-sm font-medium px-5 py-2.5 text-[#1A1815] hover:bg-[#EDE7DA] transition-colors';

export default function Landing() {
  return (
    <div className={`min-h-screen ${CANVAS} ${INK} font-sans`}>
      <Nav />
      <Hero />
      <TrustStrip />
      <Pillars />
      <UseCases />
      <Testimonials />
      <Faq />
      <Footer />
    </div>
  );
}

/* ----------------------------------------------------------------- Nav ---- */
function Nav() {
  const links = [
    ['Platform', '#platform'],
    ['Rules engine', '#rules'],
    ['Roles', '#roles'],
    ['FAQ', '#faq'],
  ];
  return (
    <header className={`sticky top-0 z-40 ${CANVAS}/85 backdrop-blur border-b ${LINE}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center">
          <img src={logoUrl} alt="TransitOps" className="h-9 w-auto bg-transparent"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </a>
        <nav className={`hidden md:flex items-center gap-8 text-sm ${MUTED}`}>
          {links.map(([l, h]) => (
            <a key={l} href={h} className="hover:text-[#1A1815] transition-colors">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className={`hidden sm:inline text-sm ${MUTED} hover:text-[#1A1815]`}>Log in</Link>
          <Link to="/login" className={BTN_DARK}>Get started <ArrowRight size={15} /></Link>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- Hero ---- */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.14em] uppercase text-[#2775CA] mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2775CA]" /> Smart transport operations · beta
        </p>
        <h1 className="font-display font-normal text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.98] tracking-[-0.02em]">
          Your control center<br />for the whole fleet.
        </h1>
        <p className={`mt-7 text-lg ${MUTED} max-w-2xl mx-auto leading-relaxed`}>
          TransitOps runs vehicles, drivers, dispatch, maintenance and cost in one place —
          and enforces every operating rule server-side, so bad data becomes impossible.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className={BTN_DARK}>Get started <ArrowRight size={16} /></Link>
          <a href="#platform" className={BTN_LINE}>See how it works</a>
        </div>
        <p className={`mt-6 text-sm ${MUTED} flex items-center justify-center gap-2`}>
          <Check size={15} className="text-[#2775CA]" /> Four roles · RBAC · full trip lifecycle
        </p>
      </div>

      {/* Big product preview band */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <DashboardPreview />
      </div>
    </section>
  );
}

// A large, faithful mock of the ops dashboard used as the hero visual.
function DashboardPreview() {
  return (
    <div className={`rounded-2xl border ${LINE} ${CARD} shadow-[0_40px_80px_-40px_rgba(26,24,21,0.35)] overflow-hidden`}>
      <div className={`flex items-center gap-1.5 px-4 h-10 border-b ${LINE}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#E0D8C7]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E0D8C7]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E0D8C7]" />
        <span className={`ml-3 text-xs ${MUTED}`}>transitops · fleet overview</span>
      </div>
      <div className="flex">
        {/* mini sidebar */}
        <div className={`hidden sm:flex flex-col gap-1 w-40 shrink-0 border-r ${LINE} p-3 text-sm`}>
          {[['Dashboard', Gauge, true], ['Vehicles', Truck], ['Drivers', Users], ['Trips', RouteIcon], ['Reports', BarChart3]].map(
            ([l, Icon, active]) => (
              <span key={l} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${active ? 'bg-[#EAF1FB] text-[#1E5EA8] font-medium' : MUTED}`}>
                <Icon size={15} /> {l}
              </span>
            )
          )}
        </div>
        {/* body */}
        <div className="flex-1 min-w-0 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[['Available', '18'], ['On trip', '11'], ['In shop', '4'], ['Utilization', '78%']].map(([l, v]) => (
              <div key={l} className={`rounded-xl border ${LINE} bg-white p-3`}>
                <div className={`text-[10px] uppercase tracking-[0.1em] ${MUTED}`}>{l}</div>
                <div className="font-display text-2xl mt-1">{v}</div>
              </div>
            ))}
          </div>
          <div className={`rounded-xl border ${LINE} bg-white overflow-hidden`}>
            <div className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.08em] ${MUTED} border-b ${LINE}`}>Active trips</div>
            {[
              ['VAN-05', 'Chennai → Salem', 'On trip', 'bg-[#E1F4EA] text-[#0F6E56]'],
              ['TRK-12', 'Erode → Kochi', 'Dispatched', 'bg-[#FBF0DA] text-[#9A6700]'],
              ['VAN-09', 'Madurai → Trichy', 'Draft', 'bg-[#ECE7DC] text-[#6B6560]'],
            ].map(([id, route, s, c]) => (
              <div key={id} className={`flex items-center justify-between px-4 py-2.5 border-b ${LINE} last:border-0 text-sm`}>
                <span className="font-mono text-xs">{id}</span>
                <span className={`${MUTED} flex-1 px-4 truncate`}>{route}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${c}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Trust strip ---- */
function TrustStrip() {
  const stats = [
    ['5', 'Business rules enforced'],
    ['4', 'Roles with scoped access'],
    ['0', 'Bad records possible'],
    ['100%', 'Server-side validation'],
  ];
  return (
    <section className={`border-y ${LINE}`}>
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-y-8">
        {stats.map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="font-display text-[clamp(2rem,4vw,2.8rem)] leading-none">{n}</div>
            <div className={`mt-2 text-xs uppercase tracking-[0.12em] ${MUTED}`}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Pillars ---- */
const PILLARS = [
  {
    icon: Truck,
    kicker: 'Registry',
    t: 'A fleet that keeps itself honest',
    d: 'Register vehicles and drivers once. Unique keys, license validity, and status transitions are enforced automatically — no spreadsheet drift.',
    points: [
      ['Unique vehicle registry', 'Duplicate plates are rejected at the database and the controller.'],
      ['Driver compliance built in', 'License expiry and suspensions are tracked and blocked at dispatch.'],
      ['Live status, always accurate', 'Available, on-trip, in-shop and retired states stay in lock-step.'],
    ],
  },
  {
    icon: RouteIcon,
    kicker: 'Dispatch',
    t: 'Dispatch with guardrails',
    d: 'Create a trip and every rule runs before it saves: capacity, licensing, availability, double-booking. Dispatch and completion move vehicle and driver state together.',
    points: [
      ['Cargo never exceeds capacity', 'The load is checked against the vehicle before dispatch.'],
      ['No double-booking', 'A vehicle or driver already on a trip cannot take a second.'],
      ['Lifecycle state machine', 'Draft → Dispatched → Completed → Cancelled, enforced server-side.'],
    ],
  },
  {
    icon: BarChart3,
    kicker: 'Analytics',
    t: 'Costs and ROI, computed',
    d: 'Fuel, maintenance and expenses roll up into operational cost, fuel efficiency and vehicle ROI — with one-click CSV export for the finance team.',
    points: [
      ['Operational cost per vehicle', 'Fuel, maintenance and tolls aggregated automatically.'],
      ['Fuel efficiency & ROI', 'Distance-per-litre and return on acquisition cost, per asset.'],
      ['One-click CSV export', 'Hand the finance team a clean report in seconds.'],
    ],
  },
];

function Pillars() {
  return (
    <section id="platform" className="max-w-6xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-16">
        <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#2775CA] mb-4">The platform</p>
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.03] tracking-[-0.02em]">
          One system for the whole operation.
        </h2>
      </div>
      <div className="space-y-20">
        {PILLARS.map((p, i) => (
          <div key={p.t} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
            <div>
              <div className="flex items-center gap-2 text-[#2775CA] mb-4">
                <p.icon size={18} />
                <span className="text-xs font-medium tracking-[0.12em] uppercase">{p.kicker}</span>
              </div>
              <h3 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-tight tracking-[-0.01em]">{p.t}</h3>
              <p className={`mt-4 ${MUTED} leading-relaxed`}>{p.d}</p>
              <ul className="mt-6 space-y-4">
                {p.points.map(([h, sub]) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#EAF1FB] text-[#2775CA]">
                      <Check size={12} />
                    </span>
                    <span>
                      <span className="block font-medium">{h}</span>
                      <span className={`block text-sm ${MUTED} leading-relaxed`}>{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <PillarVisual index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PillarVisual({ index }) {
  return (
    <div className={`rounded-2xl border ${LINE} ${CARD} p-6 shadow-[0_30px_60px_-40px_rgba(26,24,21,0.3)]`}>
      {index === 0 && (
        <div className="space-y-2.5">
          {[
            ['VAN-05', 'Available', 'bg-[#E1F4EA] text-[#0F6E56]'],
            ['TRK-12', 'On trip', 'bg-[#EAF1FB] text-[#1E5EA8]'],
            ['TRK-03', 'In shop', 'bg-[#FBF0DA] text-[#9A6700]'],
            ['VAN-14', 'Retired', 'bg-[#ECE7DC] text-[#6B6560]'],
          ].map(([id, s, c]) => (
            <div key={id} className={`flex items-center justify-between rounded-xl border ${LINE} bg-white px-4 py-3`}>
              <span className="font-mono text-sm">{id}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${c}`}>{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 text-sm text-[#A32D2D]">
            <ShieldCheck size={15} /> Duplicate plate “VAN-05” rejected
          </div>
        </div>
      )}
      {index === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            {['Draft', 'Dispatched', 'Completed'].map((s, k) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${k <= 1 ? 'bg-[#2775CA] text-white' : `border ${LINE} ${MUTED}`}`}>{k + 1}</span>
                <span className={k <= 1 ? 'font-medium' : MUTED}>{s}</span>
              </div>
            ))}
          </div>
          <div className={`rounded-xl border ${LINE} bg-white p-4`}>
            <div className={`text-xs ${MUTED} mb-2`}>Van-05 · Chennai → Salem</div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-[#2775CA]" /> Cargo 450 kg</span>
              <span className="text-[#0F6E56]">≤ 500 kg ✓</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#0F6E56]">
            <Check size={15} /> Vehicle + driver set to “On trip”
          </div>
        </div>
      )}
      {index === 2 && (
        <div className="space-y-3">
          {[
            ['VAN-05', 88, '+34%'],
            ['TRK-12', 64, '+21%'],
            ['TRK-03', 42, '+9%'],
          ].map(([id, w, roi]) => (
            <div key={id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-mono text-xs">{id}</span>
                <span className="text-[#0F6E56] text-xs">{roi} ROI</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#ECE7DC] overflow-hidden">
                <div className="h-full rounded-full bg-[#2775CA]" style={{ width: `${w}%` }} />
              </div>
            </div>
          ))}
          <div className={`flex items-center gap-2 pt-1 text-sm ${MUTED}`}>
            <Fuel size={15} className="text-[#2775CA]" /> Operational cost updated from fuel + maintenance
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- Use cases ---- */
const ROLES = [
  { name: 'Fleet Manager', icon: Truck, d: 'Owns fleet assets, maintenance and lifecycle. Registers vehicles, opens and closes shop visits, and watches utilization and cost.', bullets: ['Vehicle CRUD & registry', 'Maintenance workflow', 'Fleet-wide KPIs'] },
  { name: 'Dispatcher', icon: RouteIcon, d: 'Creates trips and runs the dispatch lifecycle. Picks an available vehicle by capacity, assigns a valid driver, and dispatches with every rule checked.', bullets: ['Create & dispatch trips', 'Capacity & availability checks', 'Complete / cancel flow'] },
  { name: 'Safety Officer', icon: ShieldCheck, d: 'Ensures driver compliance. Manages the roster, tracks license validity, sets safety scores and suspends drivers who fall out of compliance.', bullets: ['Driver roster & licensing', 'Expiry alerts', 'Suspensions'] },
  { name: 'Financial Analyst', icon: BarChart3, d: 'Reviews the numbers. Logs fuel and expenses, reads operational cost and fuel efficiency, and exports vehicle ROI for reporting.', bullets: ['Fuel & expense logging', 'Cost & efficiency reports', 'ROI + CSV export'] },
];

function UseCases() {
  const [active, setActive] = useState(0);
  const r = ROLES[active];
  return (
    <section id="roles" className={`border-y ${LINE} ${CARD}`}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#2775CA] mb-4">Role-based access</p>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.03] tracking-[-0.02em]">
            Everyone sees exactly their lane.
          </h2>
          <p className={`mt-5 ${MUTED} leading-relaxed`}>
            Four roles, each scoped by RBAC. Login decides what you can see and touch — the server enforces it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {ROLES.map((role, i) => (
            <button
              key={role.name}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors border ${
                i === active ? 'bg-[#1A1815] text-[#F5F1E9] border-[#1A1815]' : `${LINE} ${MUTED} hover:text-[#1A1815]`
              }`}
            >
              <role.icon size={15} /> {role.name}
            </button>
          ))}
        </div>
        <div className={`grid lg:grid-cols-2 gap-8 items-center rounded-2xl border ${LINE} bg-white p-8`}>
          <div>
            <div className="w-11 h-11 grid place-items-center rounded-xl bg-[#EAF1FB] text-[#2775CA]">
              <r.icon size={20} />
            </div>
            <h3 className="mt-5 font-display text-2xl tracking-[-0.01em]">{r.name}</h3>
            <p className={`mt-3 ${MUTED} leading-relaxed`}>{r.d}</p>
          </div>
          <ul className="space-y-3">
            {r.bullets.map((b) => (
              <li key={b} className={`flex items-center gap-3 rounded-xl border ${LINE} ${CARD} px-4 py-3`}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EAF1FB] text-[#2775CA]"><Check size={13} /></span>
                <span className="text-sm font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Testimonials ---- */
const QUOTES = [
  { q: 'Dispatch used to live in three spreadsheets and a group chat. Now a trip won’t even save if the cargo is over capacity — the mistakes just can’t happen anymore.', n: 'Operations Lead', o: 'Regional logistics operator' },
  { q: 'License expiries used to slip through constantly. The compliance panel flags them before a driver is ever assigned. That alone paid for the rollout.', n: 'Safety Officer', o: 'Distribution fleet, 40 vehicles' },
  { q: 'I export one CSV and I have operational cost and ROI per vehicle. What used to be a day of reconciling is now a click.', n: 'Financial Analyst', o: 'Cold-chain carrier' },
];

function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-14">
        <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#2775CA] mb-4">Why teams switch</p>
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.03] tracking-[-0.02em]">
          Fewer errors. Clearer numbers.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {QUOTES.map((t) => (
          <figure key={t.n} className={`rounded-2xl border ${LINE} ${CARD} p-7 flex flex-col`}>
            <blockquote className="font-display text-lg leading-relaxed tracking-[-0.01em]">“{t.q}”</blockquote>
            <figcaption className={`mt-6 pt-5 border-t ${LINE} text-sm`}>
              <span className="font-medium">{t.n}</span>
              <span className={`block ${MUTED}`}>{t.o}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={`mt-8 text-xs ${MUTED}`}>Illustrative scenarios shown for a demo build.</p>
    </section>
  );
}

/* ---------------------------------------------------------------- FAQ ---- */
const FAQS = [
  ['What exactly does TransitOps manage?', 'The full fleet lifecycle: a vehicle and driver registry, trip creation and dispatch, maintenance, fuel and expense logging, plus a dashboard and reports for KPIs, cost and ROI.'],
  ['What are the “business rules” it enforces?', 'Unique registration numbers, retired/in-shop vehicles kept out of dispatch, expired-license and suspended drivers blocked, no double-booking, and cargo never exceeding vehicle capacity — all enforced server-side.'],
  ['How does role-based access work?', 'There are four roles — Fleet Manager, Dispatcher, Safety Officer and Financial Analyst. Each logs in and sees a scoped set of pages and actions, gated on the server, not just hidden in the UI.'],
  ['What happens when a trip is dispatched?', 'The vehicle and driver both flip to “On trip”. Completing the trip returns them to “Available” and records the final odometer and fuel used; cancelling a dispatched trip restores them too.'],
  ['Can I get the data out?', 'Yes. The reports page computes fuel efficiency, operational cost, utilization and vehicle ROI, and exports the full table to CSV in one click.'],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className={`border-y ${LINE} ${CARD}`}>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.03] tracking-[-0.02em] mb-10">FAQs</h2>
        <div className={`border-t ${LINE}`}>
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className={`border-b ${LINE}`}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full text-left py-5 flex items-center gap-4">
                  <span className="text-[#2775CA] shrink-0">{isOpen ? <Minus size={18} /> : <Plus size={18} />}</span>
                  <span className="flex-1 font-medium">{q}</span>
                </button>
                {isOpen && <p className={`pb-6 pl-10 -mt-1 text-sm ${MUTED} leading-relaxed max-w-2xl`}>{a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Footer ---- */
function Footer() {
  const cols = [
    ['Product', ['Platform', 'Rules engine', 'Roles', 'Reports']],
    ['Roles', ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']],
    ['Resources', ['FAQ', 'Get started', 'Documentation', 'Changelog']],
    ['Company', ['About', 'Careers', 'Privacy', 'Terms']],
  ];
  return (
    <footer className={CANVAS}>
      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="rounded-3xl bg-[#1A1815] text-[#F5F1E9] px-8 py-16 text-center relative overflow-hidden">
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.03] tracking-[-0.02em] max-w-2xl mx-auto">
            Put the whole fleet on rails.
          </h2>
          <p className="mt-4 text-[#C9C2B4] max-w-lg mx-auto">Register a vehicle, add a driver, and dispatch your first rule-checked trip in minutes.</p>
          <div className="mt-8 flex justify-center">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-[#F5F1E9] text-[#1A1815] text-sm font-medium px-6 py-3 hover:bg-white transition-colors">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <img src={logoUrl} alt="TransitOps" className="h-9 w-auto bg-transparent"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <p className={`mt-4 text-sm ${MUTED} leading-relaxed`}>Smart Transport Operations Platform.</p>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#8A837A] mb-4">{h}</p>
            <ul className="space-y-2.5">
              {items.map((it) => (
                <li key={it}>
                  <Link to="/login" className={`text-sm ${MUTED} hover:text-[#1A1815] transition-colors`}>{it}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`border-t ${LINE}`}>
        <div className={`max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm ${MUTED}`}>
          <div className="flex items-center gap-2"><LogoMark size={20} /> © {new Date().getFullYear()} TransitOps</div>
          <span>Built for the TransitOps hackathon.</span>
        </div>
      </div>
    </footer>
  );
}
