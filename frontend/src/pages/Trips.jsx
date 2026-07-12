import { useState } from 'react';
import { Plus, Send, CheckCircle2, XCircle } from 'lucide-react';
import { tripApi, vehicleApi, driverApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { can } from '../lib/rbac.js';
import { number } from '../lib/format.js';
import { PageHeader, Button, StatusPill } from '../components/ui.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Modal, Field, Input, Select } from '../components/Modal.jsx';

export default function Trips() {
  const { role } = useAuth();
  const toast = useToast();
  const writable = can(role, 'trips_write');
  const { data: trips, loading, refetch } = useFetch(() => tripApi.list(), []);

  const [newOpen, setNewOpen] = useState(false);
  const [completeTrip, setCompleteTrip] = useState(null);

  const act = async (fn, okMsg) => {
    try {
      await fn();
      toast.success(okMsg);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'source', header: 'Route', sortable: false, render: (t) => (
        <span className="font-medium">{t.source} → {t.destination}</span>
      ) },
    { key: 'vehicle', header: 'Vehicle', sortable: false, render: (t) => t.vehicle?.registrationNumber || '—' },
    { key: 'driver', header: 'Driver', sortable: false, render: (t) => t.driver?.name || '—' },
    { key: 'cargoWeight', header: 'Cargo (kg)', render: (t) => number(t.cargoWeight) },
    { key: 'plannedDistance', header: 'Distance (km)', render: (t) => number(t.plannedDistance) },
    { key: 'status', header: 'Status', render: (t) => <StatusPill status={t.status} /> },
    ...(writable
      ? [{
          key: 'actions', header: '', sortable: false,
          render: (t) => (
            <div className="flex gap-1 justify-end">
              {t.status === 'draft' && (
                <Button variant="secondary" size="sm" onClick={() => act(() => tripApi.dispatch(t._id), 'Trip dispatched.')}>
                  <Send size={14} /> Dispatch
                </Button>
              )}
              {t.status === 'dispatched' && (
                <Button variant="secondary" size="sm" onClick={() => setCompleteTrip(t)}>
                  <CheckCircle2 size={14} /> Complete
                </Button>
              )}
              {(t.status === 'draft' || t.status === 'dispatched') && (
                <Button variant="ghost" size="sm" onClick={() => act(() => tripApi.cancel(t._id), 'Trip cancelled.')}>
                  <XCircle size={14} />
                </Button>
              )}
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Trips" subtitle="Dispatch & lifecycle">
        {writable && (
          <Button onClick={() => setNewOpen(true)}>
            <Plus size={16} /> New trip
          </Button>
        )}
      </PageHeader>

      {loading && !trips ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={trips || []} searchKeys={['source', 'destination']} emptyMessage="No trips yet." />
      )}

      {newOpen && (
        <NewTripModal
          onClose={() => setNewOpen(false)}
          onCreated={() => {
            setNewOpen(false);
            refetch();
          }}
        />
      )}

      {completeTrip && (
        <CompleteTripModal
          trip={completeTrip}
          onClose={() => setCompleteTrip(null)}
          onDone={() => {
            setCompleteTrip(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// --- New trip: pick available vehicle, then driver, validate cargo client-side too ---
function NewTripModal({ onClose, onCreated }) {
  const toast = useToast();
  const { data: vehicles } = useFetch(() => vehicleApi.available(), []);
  const { data: drivers } = useFetch(() => driverApi.available(), []);
  const [form, setForm] = useState({
    source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', plannedDistance: '', revenue: '',
  });
  const [busy, setBusy] = useState(false);

  const selectedVehicle = (vehicles || []).find((v) => v._id === form.vehicle);
  const overCapacity = selectedVehicle && Number(form.cargoWeight) > selectedVehicle.maxLoadCapacity;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await tripApi.create({
        ...form,
        cargoWeight: Number(form.cargoWeight),
        plannedDistance: Number(form.plannedDistance),
        revenue: Number(form.revenue || 0),
      });
      toast.success('Trip created.');
      onCreated();
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
      title="New trip"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="trip-form" disabled={busy || overCapacity}>
            {busy ? 'Creating…' : 'Create trip'}
          </Button>
        </>
      }
    >
      <form id="trip-form" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source">
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
          </Field>
          <Field label="Destination">
            <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
          </Field>
        </div>
        <Field label="Vehicle" hint="Only available vehicles are listed (retired / in-shop / on-trip excluded).">
          <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
            <option value="">Select a vehicle…</option>
            {(vehicles || []).map((v) => (
              <option key={v._id} value={v._id}>
                {v.registrationNumber} — {v.name} (cap {number(v.maxLoadCapacity)} kg)
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Driver" hint="Only assignable drivers (available, valid license, not suspended).">
          <Select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
            <option value="">Select a driver…</option>
            {(drivers || []).map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} — {d.licenseNumber}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Cargo weight (kg)"
            hint={
              selectedVehicle
                ? overCapacity
                  ? `Exceeds capacity of ${number(selectedVehicle.maxLoadCapacity)} kg`
                  : `Capacity: ${number(selectedVehicle.maxLoadCapacity)} kg`
                : undefined
            }
          >
            <Input
              type="number" min="0" required value={form.cargoWeight}
              onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })}
              className={overCapacity ? 'border-red-400' : ''}
            />
          </Field>
          <Field label="Planned distance (km)">
            <Input type="number" min="0" required value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} />
          </Field>
        </div>
        <Field label="Revenue (optional)">
          <Input type="number" min="0" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
        </Field>
        {overCapacity && (
          <p className="text-sm text-red-600">Cargo exceeds the selected vehicle's capacity.</p>
        )}
      </form>
    </Modal>
  );
}

// --- Complete trip: final odometer + fuel consumed ---
function CompleteTripModal({ trip, onClose, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ finalOdometer: '', fuelConsumed: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await tripApi.complete(trip._id, {
        finalOdometer: Number(form.finalOdometer),
        fuelConsumed: Number(form.fuelConsumed),
      });
      toast.success('Trip completed. Vehicle & driver freed.');
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
      title={`Complete trip · ${trip.source} → ${trip.destination}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="complete-form" disabled={busy}>
            {busy ? 'Completing…' : 'Complete trip'}
          </Button>
        </>
      }
    >
      <form id="complete-form" onSubmit={submit}>
        <Field label="Final odometer (km)" hint="Must be ≥ current vehicle odometer.">
          <Input type="number" min="0" required value={form.finalOdometer} onChange={(e) => setForm({ ...form, finalOdometer: e.target.value })} />
        </Field>
        <Field label="Fuel consumed (L)">
          <Input type="number" min="0" step="0.1" required value={form.fuelConsumed} onChange={(e) => setForm({ ...form, fuelConsumed: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
