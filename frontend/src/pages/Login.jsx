import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Card } from '../components/ui.jsx';
import { Field, Input } from '../components/Modal.jsx';

const DEMO = [
  { role: 'Fleet Manager', email: 'manager@transitops.dev' },
  { role: 'Dispatcher', email: 'dispatcher@transitops.dev' },
  { role: 'Safety Officer', email: 'safety@transitops.dev' },
  { role: 'Financial Analyst', email: 'finance@transitops.dev' },
];

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
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="p-2 rounded-control bg-brand text-white">
            <Bus size={22} />
          </span>
          <span className="text-xl font-semibold text-ink">TransitOps</span>
        </div>
        <Card className="p-6">
          <h1 className="text-lg font-semibold text-ink mb-1">Sign in</h1>
          <p className="text-sm text-muted mb-5">Smart transport operations platform</p>
          <form onSubmit={submit}>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
        <Card className="mt-4 p-4">
          <p className="text-xs font-medium text-muted mb-2">Demo accounts (password: password123)</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.email}
                onClick={() => setEmail(d.email)}
                className="text-left rounded-control border border-hairline px-2.5 py-1.5 hover:bg-bg"
              >
                <span className="block text-xs font-medium text-ink">{d.role}</span>
                <span className="block text-[11px] text-muted truncate">{d.email}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
