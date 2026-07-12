import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { vehicleApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { can } from '../lib/rbac.js';
import { VEHICLE_TYPES, VEHICLE_STATUS, REGIONS } from '../lib/constants.js';
import { number, currency, label } from '../lib/format.js';
import { PageHeader, Button, StatusPill } from '../components/ui.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Modal, Field, Input, Select, ConfirmDialog } from '../components/Modal.jsx';

const empty = {
  registrationNumber: '',
  name: '',
  type: 'van',
  maxLoadCapacity: '',
  odometer: 0,
  acquisitionCost: '',
  region: 'North',
  status: 'available',
};

export default function Vehicles() {
  const { role } = useAuth();
  const toast = useToast();
  const writable = can(role, 'vehicles_write');
  const { data: vehicles, loading, refetch } = useFetch(() => vehicleApi.list(), []);

  const [modal, setModal] = useState(null); // { mode:'create'|'edit', data }
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const openCreate = () => {
    setForm(empty);
    setModal({ mode: 'create' });
  };
  const openEdit = (v) => {
    setForm({ ...v });
    setModal({ mode: 'edit', data: v });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...form,
        maxLoadCapacity: Number(form.maxLoadCapacity),
        odometer: Number(form.odometer),
        acquisitionCost: Number(form.acquisitionCost || 0),
      };
      if (modal.mode === 'create') {
        await vehicleApi.create(body);
        toast.success('Vehicle registered.');
      } else {
        await vehicleApi.update(modal.data._id, body);
        toast.success('Vehicle updated.');
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
      await vehicleApi.remove(confirmDel._id);
      toast.success('Vehicle deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmDel(null);
    }
  };

  const columns = [
    { key: 'registrationNumber', header: 'Reg number', render: (v) => <span className="font-medium">{v.registrationNumber}</span> },
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type', render: (v) => label(v.type) },
    { key: 'maxLoadCapacity', header: 'Capacity (kg)', render: (v) => number(v.maxLoadCapacity) },
    { key: 'odometer', header: 'Odometer (km)', render: (v) => number(v.odometer) },
    { key: 'region', header: 'Region' },
    { key: 'status', header: 'Status', render: (v) => <StatusPill status={v.status} /> },
    ...(writable
      ? [{
          key: 'actions', header: '', sortable: false,
          render: (v) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(v)}><Pencil size={15} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDel(v)}><Trash2 size={15} /></Button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Vehicles" subtitle="Fleet register">
        {writable && (
          <Button onClick={openCreate}>
            <Plus size={16} /> Register vehicle
          </Button>
        )}
      </PageHeader>

      {loading && !vehicles ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={vehicles || []} searchKeys={['registrationNumber', 'name', 'region']} emptyMessage="No vehicles yet." />
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit vehicle' : 'Register vehicle'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy} form="vehicle-form" type="submit">
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="vehicle-form" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Registration number">
              <Input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required />
            </Field>
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
              </Select>
            </Field>
            <Field label="Max load capacity (kg)">
              <Input type="number" min="0" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} required />
            </Field>
            <Field label="Odometer (km)">
              <Input type="number" min="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
            </Field>
            <Field label="Acquisition cost">
              <Input type="number" min="0" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
            </Field>
            <Field label="Region">
              <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete vehicle"
        message={`Delete ${confirmDel?.registrationNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={doDelete}
        onClose={() => setConfirmDel(null)}
      />
    </div>
  );
}
