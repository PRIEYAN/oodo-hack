import { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { maintenanceApi, vehicleApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { can } from '../lib/rbac.js';
import { currency, date } from '../lib/format.js';
import { PageHeader, Button, StatusPill } from '../components/ui.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Modal, Field, Input, Select } from '../components/Modal.jsx';

export default function Maintenance() {
  const { role } = useAuth();
  const toast = useToast();
  const writable = can(role, 'maintenance_write');
  const { data: logs, loading, refetch } = useFetch(() => maintenanceApi.list(), []);

  const [open, setOpen] = useState(false);

  const close = async (log) => {
    try {
      await maintenanceApi.close(log._id);
      toast.success('Maintenance closed. Vehicle available again.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'vehicle', header: 'Vehicle', sortable: false, render: (m) => m.vehicle?.registrationNumber || '—' },
    { key: 'type', header: 'Type' },
    { key: 'description', header: 'Description', render: (m) => m.description || '—' },
    { key: 'cost', header: 'Cost', render: (m) => currency(m.cost) },
    { key: 'openedAt', header: 'Opened', render: (m) => date(m.openedAt) },
    { key: 'closedAt', header: 'Closed', render: (m) => date(m.closedAt) },
    { key: 'status', header: 'Status', render: (m) => <StatusPill status={m.status} /> },
    ...(writable
      ? [{
          key: 'actions', header: '', sortable: false,
          render: (m) => m.status === 'open' ? (
            <Button variant="secondary" size="sm" onClick={() => close(m)}>
              <CheckCircle2 size={14} /> Close
            </Button>
          ) : null,
        }]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Shop workflow">
        {writable && (
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Open maintenance
          </Button>
        )}
      </PageHeader>

      {loading && !logs ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={logs || []} searchKeys={['type', 'description']} emptyMessage="No maintenance logs yet." />
      )}

      {open && (
        <OpenMaintenanceModal
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function OpenMaintenanceModal({ onClose, onDone }) {
  const toast = useToast();
  // Only available vehicles can enter the shop.
  const { data: vehicles } = useFetch(() => vehicleApi.available(), []);
  const [form, setForm] = useState({ vehicle: '', type: 'Oil Change', cost: '', description: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await maintenanceApi.open({ ...form, cost: Number(form.cost || 0) });
      toast.success('Maintenance opened. Vehicle moved to in-shop.');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Open maintenance"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="maint-form" disabled={busy}>
            {busy ? 'Opening…' : 'Open'}
          </Button>
        </>
      }
    >
      <form id="maint-form" onSubmit={submit}>
        <Field label="Vehicle" hint="Only available vehicles can enter the shop.">
          <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
            <option value="">Select a vehicle…</option>
            {(vehicles || []).map((v) => (
              <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Type">
          <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        </Field>
        <Field label="Estimated cost">
          <Input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
        </Field>
        <Field label="Description">
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
