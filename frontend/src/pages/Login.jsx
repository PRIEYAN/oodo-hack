import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogoMark, RouteWatermark } from '../components/Logo.jsx';

/*
  Login is intentionally locked to the warm "light" palette (same as the
  landing) using fixed colors, so it never flips with the app's dark-mode
  toggle. Keep hex values here rather than theme tokens.
*/

const DEMO = [
  { role: 'Fleet Manager', email: 'manager@transitops.dev' },
  { role: 'Dispatcher', email: 'dispatcher@transitops.dev' },
  { role: 'Safety Officer', email: 'safety@transitops.dev' },
  { role: 'Financial Analyst', email: 'finance@transitops.dev' },
];

const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A837A]';
const inputCls =
  'w-full rounded-lg border border-[#E7E0D2] bg-[#FDFBF6] px-3.5 py-2.5 text-sm text-[#1A1815] outline-none focus:border-[#2775CA] focus:ring-1 focus:ring-[#2775CA] transition';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@transitops.dev');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F5F1E9] text-[#1A1815]">
      {/* Left brand panel — fixed warm-black */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[#1A1815] text-white p-12 overflow-hidden">
        <RouteWatermark className="absolute -right-16 -bottom-16 w-[420px] h-[420px] text-[#2775CA]/25" />
        <Link to="/" className="relative flex items-center gap-2">
          <LogoMark size={30} />
          <span className="font-semibold tracking-tight">TransitOps</span>
        </Link>
        <div className="relative">
          <p className={`${EYEBROW} !text-white/50 mb-5`}>Smart transport operations</p>
          <h1 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.04] tracking-[-0.02em]">
            Your control center
            <br />
            for the <span className="text-[#5FA0E8] italic">whole</span> fleet.
          </h1>
          <p className="mt-5 text-white/60 max-w-sm leading-relaxed">
            Every operating rule enforced server-side, so bad data becomes impossible.
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-white/50">
          <ShieldCheck size={15} className="text-[#5FA0E8]" />
          Four roles · RBAC · full trip lifecycle
        </div>
      </div>

      {/* Right form panel — fixed ivory */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-[#F5F1E9]">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B6560] hover:text-[#1A1815] mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to home
          </Link>

          <p className={`${EYEBROW} mb-3`}>Welcome back</p>
          <h2 className="font-display text-3xl mb-1 tracking-[-0.01em]">Sign in</h2>
          <p className="text-sm text-[#6B6560] mb-8">Access your operations workspace.</p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Email</span>
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Password</span>
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1A1815] text-[#F5F1E9] text-sm font-medium px-4 py-3 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {busy ? 'Signing in…' : 'Sign in'} {!busy && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-8">
            <p className={`${EYEBROW} mb-3`}>Demo accounts · password123</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => setEmail(d.email)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    email === d.email
                      ? 'border-[#2775CA] bg-[#EAF1FB]'
                      : 'border-[#E7E0D2] hover:bg-[#EDE7DA]'
                  }`}
                >
                  <span className="block text-xs font-medium text-[#1A1815]">{d.role}</span>
                  <span className="block text-[11px] text-[#6B6560] truncate">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
