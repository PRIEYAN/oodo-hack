import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { driverApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { can } from '../lib/rbac.js';
import { DRIVER_STATUS } from '../lib/constants.js';
import { date, label } from '../lib/format.js';
import { PageHeader, Button, StatusPill } from '../components/ui.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Modal, Field, Input, Select, ConfirmDialog } from '../components/Modal.jsx';

const empty = {
  name: '',
  licenseNumber: '',
  category: 'C',
  licenseExpiry: '',
  contactNumber: '',
  safetyScore: 100,
  status: 'available',
};

function isExpired(d) {
  return d.licenseExpiry && new Date(d.licenseExpiry) < new Date();
}

export default function Drivers() {
  const { role } = useAuth();
  const toast = useToast();
  const writable = can(role, 'drivers_write');
  const { data: drivers, loading, refetch } = useFetch(() => driverApi.list(), []);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const openCreate = () => {
    setForm(empty);
    setModal({ mode: 'create' });
  };
  const openEdit = (d) => {
    setForm({ ...d, licenseExpiry: d.licenseExpiry ? d.licenseExpiry.slice(0, 10) : '' });
    setModal({ mode: 'edit', data: d });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form, safetyScore: Number(form.safetyScore) };
      if (modal.mode === 'create') {
        await driverApi.create(body);
        toast.success('Driver registered.');
      } else {
        await driverApi.update(modal.data._id, body);
        toast.success('Driver updated.');
      }
      setModal(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    try {
      await driverApi.remove(confirmDel._id);
      toast.success('Driver deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmDel(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (d) => <span className="font-medium">{d.name}</span> },
    { key: 'licenseNumber', header: 'License' },
    { key: 'category', header: 'Category' },
    {
      key: 'licenseExpiry',
      header: 'Expiry',
      render: (d) => (
        <span className={isExpired(d) ? 'text-red-600 inline-flex items-center gap-1' : ''}>
          {isExpired(d) && <AlertTriangle size={13} />}
          {date(d.licenseExpiry)}
        </span>
      ),
    },
    { key: 'safetyScore', header: 'Safety', render: (d) => `${d.safetyScore}` },
    { key: 'status', header: 'Status', render: (d) => <StatusPill status={d.status} /> },
    ...(writable
      ? [{
          key: 'actions', header: '', sortable: false,
          render: (d) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil size={15} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDel(d)}><Trash2 size={15} /></Button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Drivers" subtitle="Driver roster & licensing">
        {writable && (
          <Button onClick={openCreate}>
            <Plus size={16} /> Register driver
          </Button>
        )}
      </PageHeader>

      {loading && !drivers ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={drivers || []} searchKeys={['name', 'licenseNumber']} emptyMessage="No drivers yet." />
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit driver' : 'Register driver'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy} type="submit" form="driver-form">
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="driver-form" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="License number">
              <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
            <Field label="License expiry">
              <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} required />
            </Field>
            <Field label="Contact number">
              <Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
            </Field>
            <Field label="Safety score (0-100)">
              <Input type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {DRIVER_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete driver"
        message={`Delete ${confirmDel?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={doDelete}
        onClose={() => setConfirmDel(null)}
      />
    </div>
  );
}
