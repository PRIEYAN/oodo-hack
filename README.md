# TransitOps — Smart Transport Operations Platform

A centralized web platform that digitizes a logistics company's fleet: register
vehicles and drivers, create and dispatch trips, run maintenance, log fuel and
expenses, and view analytics — while the system **automatically enforces the
business rules** (unique reg numbers, capacity limits, license validity, status
transitions) so bad data becomes impossible. Four roles get scoped access via RBAC.

> **Naming note.** The spec's **"Driver"** role is the person who *creates trips
> and assigns vehicles/drivers* — functionally a **dispatcher**. We keep the
> spec's name **`driver`** verbatim on the backend to match the rubric, and label
> it "Dispatcher" in the UI for clarity.

---

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React (Vite) + React Router + Tailwind + Recharts + lucide-react |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| CSV export | hand-rolled (no dependency) |

Design: USDC-inspired "trustworthy fintech" theme — one confident blue (`#2775CA`),
deep-navy full-bleed bands, an editorial serif display face (Fraunces), hairline
borders, big KPI numbers, soft status pills.

---

## Prerequisites

- Node.js 18+
- A running MongoDB on `mongodb://127.0.0.1:27017`

> If you don't run Mongo as a service, start one against a local data dir:
> ```bash
> mkdir -p .mongo-data
> mongod --dbpath ./.mongo-data --port 27017
> ```

---

## Ports

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:5050/api` |
| Frontend | `http://localhost:5173` |

> **Why 5050 and not 5000?** On macOS, port 5000 is taken by the AirPlay
> Receiver (ControlCenter). The API therefore runs on **5050**; the frontend
> points at it via `frontend/.env` → `VITE_API_URL`. Change both `backend/.env`
> (`PORT`) and `frontend/.env` if you want a different port.

---

## Setup & run

From the repo root (`transit_ops/`):

```bash
npm run install:all     # installs root + backend + frontend
npm run seed            # seed demo data (users, vehicles, drivers, trips, ...)
npm run dev             # boots BOTH servers (concurrently)
```

Or run each independently in its own terminal:

```bash
npm run backend         # http://localhost:5050
npm run frontend        # http://localhost:5173
```

Then open **http://localhost:5173** and click **Get started**.

---

## Demo accounts

All use password **`password123`**:

| Role (UI label) | Email | Backend role |
|-----------------|-------|--------------|
| Fleet Manager | `manager@transitops.dev` | `fleet_manager` |
| Dispatcher | `dispatcher@transitops.dev` | `driver` |
| Safety Officer | `safety@transitops.dev` | `safety_officer` |
| Financial Analyst | `finance@transitops.dev` | `financial_analyst` |

---

## Business rules (all enforced server-side)

1. **Unique registration number** — unique index + duplicate-key handling.
2. **Retired / in-shop vehicles never appear in dispatch** — `/vehicles/available`
   returns `status === 'available'` only.
3. **Expired license or suspended driver cannot be assigned** — checked on trip create.
4. **No double-booking** — a vehicle/driver already `on_trip` is rejected.
5. **Cargo ≤ capacity** — rejected if `cargoWeight > vehicle.maxLoadCapacity`.

**Status transitions** live in one place, `backend/src/utils/statusMachine.js`:

- Dispatch (`draft→dispatched`): vehicle + driver → `on_trip`.
- Complete (`dispatched→completed`, needs finalOdometer + fuelConsumed): vehicle +
  driver → `available`, vehicle odometer updated.
- Cancel dispatched (`dispatched→cancelled`): restore vehicle + driver to `available`.
- Open maintenance: vehicle → `in_shop`. Close: → `available` (unless retired).

> MongoDB runs standalone here (no replica set), so multi-document updates use
> careful sequential writes rather than transactions.

---

## RBAC matrix

| Area | fleet_manager | driver | safety_officer | financial_analyst |
|------|:--:|:--:|:--:|:--:|
| Vehicles CRUD | ✅ | read | read | read |
| Drivers CRUD | ✅ | read | ✅ | read |
| Trips create/dispatch | read | ✅ | read | read |
| Maintenance | ✅ | read | read | read |
| Fuel/Expenses | ✅ | ✅ | — | ✅ |
| Reports | ✅ | read | read | ✅ |

The frontend hides/disables controls by role; the server is the real gate.

---

## Example workflow (Section-8 end-to-end)

1. Register vehicle `VAN-05` (500 kg, available).
2. Register driver `Alex` (valid license).
3. Create trip, cargo 450 kg → `450 ≤ 500` passes.
4. Dispatch → VAN-05 + Alex become `on_trip`.
5. Complete (final odometer + fuel) → both back to `available`, odometer updated.
6. Open maintenance (Oil Change) → VAN-05 → `in_shop`, drops out of dispatch pool.
7. Reports reflect updated operational cost + fuel efficiency.

---

## Project structure

```
transit_ops/
  package.json          root scripts (install:all / seed / dev via concurrently)
  backend/              Express + Mongoose API (own package.json)
    src/
      models/ routes/ controllers/ middleware/ utils/
      seed.js  app.js  server.js
    .env                PORT, MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN
  frontend/             React + Vite app (own package.json)
    src/
      api/ components/ pages/ context/ hooks/ lib/
    .env                VITE_API_URL
  README.md
```
