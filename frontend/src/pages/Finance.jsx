import { useState } from 'react';
import { Plus, Fuel, Receipt } from 'lucide-react';
import { financeApi, vehicleApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { can } from '../lib/rbac.js';
import { EXPENSE_CATEGORIES } from '../lib/constants.js';
import { currency, number, date, label } from '../lib/format.js';
import { PageHeader, Button, Card } from '../components/ui.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Modal, Field, Input, Select } from '../components/Modal.jsx';

export default function Finance() {
  const { role } = useAuth();
  const writable = can(role, 'finance_write');
  const [tab, setTab] = useState('fuel');

  return (
    <div>
      <PageHeader title="Fuel & expenses" subtitle="Operating cost inputs" />

      <div className="flex gap-1 mb-4 border-b border-hairline">
        <TabButton active={tab === 'fuel'} onClick={() => setTab('fuel')} icon={Fuel}>Fuel logs</TabButton>
        <TabButton active={tab === 'expenses'} onClick={() => setTab('expenses')} icon={Receipt}>Expenses</TabButton>
      </div>

      {tab === 'fuel' ? <FuelTab writable={writable} /> : <ExpenseTab writable={writable} />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
        active ? 'border-brand text-brand font-medium' : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function FuelTab({ writable }) {
  const toast = useToast();
  const { data: logs, loading, refetch } = useFetch(() => financeApi.listFuel(), []);
  const { data: vehicles } = useFetch(() => vehicleApi.list(), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicle: '', liters: '', cost: '', odometer: '', date: today() });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await financeApi.createFuel({
        ...form, liters: Number(form.liters), cost: Number(form.cost), odometer: Number(form.odometer || 0),
      });
      toast.success('Fuel logged.');
      setOpen(false);
      setForm({ vehicle: '', liters: '', cost: '', odometer: '', date: today() });
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'vehicle', header: 'Vehicle', sortable: false, render: (r) => r.vehicle?.registrationNumber || '—' },
    { key: 'liters', header: 'Liters', render: (r) => number(r.liters, 1) },
    { key: 'cost', header: 'Cost', render: (r) => currency(r.cost) },
    { key: 'odometer', header: 'Odometer', render: (r) => number(r.odometer) },
    { key: 'date', header: 'Date', render: (r) => date(r.date) },
  ];

  return (
    <div>
      {writable && (
        <div className="flex justify-end mb-3">
          <Button onClick={() => setOpen(true)}><Plus size={16} /> Log fuel</Button>
        </div>
      )}
      {loading && !logs ? <p className="text-sm text-muted">Loading…</p> : (
        <DataTable columns={columns} rows={logs || []} searchable={false} emptyMessage="No fuel logs yet." />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Log fuel"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="fuel-form" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </>}>
        <form id="fuel-form" onSubmit={submit}>
          <Field label="Vehicle">
            <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
              <option value="">Select…</option>
              {(vehicles || []).map((v) => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Liters"><Input type="number" min="0" step="0.1" required value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} /></Field>
            <Field label="Cost"><Input type="number" min="0" required value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
            <Field label="Odometer"><Input type="number" min="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} /></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ExpenseTab({ writable }) {
  const toast = useToast();
  const { data: items, loading, refetch } = useFetch(() => financeApi.listExpenses(), []);
  const { data: vehicles } = useFetch(() => vehicleApi.list(), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicle: '', category: 'toll', amount: '', note: '', date: today() });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await financeApi.createExpense({ ...form, amount: Number(form.amount) });
      toast.success('Expense logged.');
      setOpen(false);
      setForm({ vehicle: '', category: 'toll', amount: '', note: '', date: today() });
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'vehicle', header: 'Vehicle', sortable: false, render: (r) => r.vehicle?.registrationNumber || '—' },
    { key: 'category', header: 'Category', render: (r) => label(r.category) },
    { key: 'amount', header: 'Amount', render: (r) => currency(r.amount) },
    { key: 'note', header: 'Note', render: (r) => r.note || '—' },
    { key: 'date', header: 'Date', render: (r) => date(r.date) },
  ];

  return (
    <div>
      {writable && (
        <div className="flex justify-end mb-3">
          <Button onClick={() => setOpen(true)}><Plus size={16} /> Log expense</Button>
        </div>
      )}
      {loading && !items ? <p className="text-sm text-muted">Loading…</p> : (
        <DataTable columns={columns} rows={items || []} searchable={false} emptyMessage="No expenses yet." />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Log expense"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="exp-form" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </>}>
        <form id="exp-form" onSubmit={submit}>
          <Field label="Vehicle">
            <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
              <option value="">Select…</option>
              {(vehicles || []).map((v) => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
              </Select>
            </Field>
            <Field label="Amount"><Input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          </div>
          <Field label="Note"><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
        </form>
      </Modal>
    </div>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
