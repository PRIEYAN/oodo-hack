# TransitOps — Smart Transport Operations Platform

**Digitize fleet operations. Enforce the rules automatically.**

TransitOps is a full-stack logistics operations platform that centralizes vehicles, drivers, trip dispatch, maintenance, fuel & expenses, and analytics in one web app. Every critical business rule is enforced **on the server**, so invalid fleet state (double-booking, overload, expired licenses, in-shop vehicles on the road) cannot be saved.

| | |
|---|---|
| **Stack** | React · Express · MongoDB · JWT |
| **Auth** | Role-based access control (4 roles) |
| **Core idea** | Central status machine + validation on every write |
| **Repo** | [github.com/PRIEYAN/oodo-hack](https://github.com/PRIEYAN/oodo-hack) |

> **Hackathon note — role naming.** The problem statement’s **“Driver”** role is the person who *creates trips and assigns vehicles/drivers* — functionally a **dispatcher**. The backend role remains `driver` (rubric alignment). The UI labels it **Dispatcher**.

---

## Table of contents

1. [Problem](#1-problem)
2. [Solution](#2-solution)
3. [Key features](#3-key-features)
4. [Tech stack](#4-tech-stack)
5. [Architecture](#5-architecture)
6. [Data models](#6-data-models)
7. [Business rules engine](#7-business-rules-engine)
8. [Status machine](#8-status-machine)
9. [RBAC](#9-rbac)
10. [Application modules](#10-application-modules)
11. [API reference](#11-api-reference)
12. [Reports & formulas](#12-reports--formulas)
13. [Demo accounts & seed data](#13-demo-accounts--seed-data)
14. [Quick start](#14-quick-start)
15. [Environment variables](#15-environment-variables)
16. [npm scripts](#16-npm-scripts)
17. [Project structure](#17-project-structure)
18. [End-to-end demo script](#18-end-to-end-demo-script)
19. [Negative test cases](#19-negative-test-cases)
20. [Troubleshooting](#20-troubleshooting)

---

## 1. Problem

Logistics and transport companies still run day-to-day ops on spreadsheets, WhatsApp threads, and tribal knowledge. That breaks down quickly:

| Pain | Consequence |
|------|-------------|
| No shared source of truth | Conflicting vehicle/driver assignments |
| Manual capacity checks | Overloaded trucks, safety & compliance risk |
| License expiry ignored | Illegal or uninsured trips |
| Shop / retired units still “available” | Dispatch from assets that cannot move |
| Costs scattered across receipts | No reliable fuel efficiency or ROI |
| Soft permissions in the UI only | Anyone can bypass rules with a raw API call |

The result: bad data, double-booking, and reports nobody trusts.

---

## 2. Solution

TransitOps is a **single control center** for the fleet with three pillars:

1. **Operational CRUD** — vehicles, drivers, trips, maintenance, fuel, expenses  
2. **Hard business rules** — validated in Express controllers before any write  
3. **Role-scoped access** — JWT + RBAC on every protected route; UI mirrors permissions

```
┌─────────────┐     JWT      ┌──────────────────┐     Mongoose     ┌──────────┐
│  React SPA  │ ───────────► │  Express API     │ ───────────────► │ MongoDB  │
│  Vite :5173 │ ◄─────────── │  :5050 /api      │ ◄─────────────── │ transitops│
└─────────────┘   JSON/CSV   │  + statusMachine │                  └──────────┘
                             │  + requireRole   │
                             └──────────────────┘
```

Invalid operations return clear `400` errors. Valid transitions update trip, vehicle, and driver status together via `backend/src/utils/statusMachine.js`.

---

## 3. Key features

### Authentication & roles
- Email/password login with **bcrypt** hashing and **JWT** sessions (default 7 days)
- Four roles: Fleet Manager, Dispatcher (`driver`), Safety Officer, Financial Analyst
- Protected React routes; nav items filtered per role

### Fleet & people
- **Vehicles** — registration (unique), type, capacity, odometer, acquisition cost, region, status
- **Drivers** — license number (unique), category, expiry, safety score (0–100), status
- Available-only lists for dispatch pickers

### Trip lifecycle
- Create **draft** trips with full validation up front
- **Dispatch** → assets become `on_trip`
- **Complete** → requires final odometer + fuel; restores availability; updates odometer
- **Cancel** → restores assets if the trip was already dispatched

### Maintenance & money
- Open/close shop jobs (vehicle → `in_shop` / back to `available`)
- Fuel logs (liters, cost, odometer) and expenses (`toll` | `maintenance` | `other`)

### Analytics
- Dashboard KPIs: counts, utilization %, status donut
- Per-vehicle reports: distance, fuel efficiency, operational cost, revenue, ROI
- One-click **CSV export** (no external CSV library)

### Product surface
- Marketing landing page with platform / rules / roles / FAQ sections
- Toast feedback, modals, data tables, dark-capable app chrome

---

## 4. Tech stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React 18, Vite, React Router | Fast SPA with simple routing |
| Styling | Tailwind CSS, lucide-react | Utility-first UI + icons |
| Charts | Recharts | Dashboard / report visuals |
| HTTP | Axios | Interceptors for JWT |
| Backend | Node.js, Express | Lightweight REST API |
| Database | MongoDB, Mongoose | Flexible documents + indexes |
| Auth | jsonwebtoken, bcryptjs | Stateless auth + hashed passwords |
| Monorepo scripts | concurrently, nodemon | One-command `npm run dev` |

**Design language:** USDC-inspired “trustworthy fintech” — primary blue `#2775CA`, deep-navy bands, Fraunces display face, hairline borders, large KPI numerals, soft status pills.

---

## 5. Architecture

### Request flow

```
Browser
  → Axios (Authorization: Bearer <jwt>)
  → Express cors + json
  → auth middleware (verify JWT, attach req.user)
  → requireRole(...) when writing
  → controller (business rules)
  → statusMachine helpers (multi-doc status updates)
  → Mongoose models
  → JSON response | CSV | ApiError → errorHandler
```

### Important design choices

| Decision | Detail |
|----------|--------|
| Server is source of truth | Frontend `can()` only hides controls; API rejects unauthorized/invalid writes |
| Status transitions centralized | All trip/maintenance side-effects live in `statusMachine.js` |
| No Mongo transactions | Standalone Mongo (no replica set); sequential saves with defensive re-fetches |
| Unique constraints | `registrationNumber`, `licenseNumber`, `email` unique indexes |
| DNS for Atlas | `server.js` forces Google/Cloudflare DNS for `mongodb+srv` SRV lookups |

### Ports

| Service | Default URL |
|---------|-------------|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:5050/api |
| Health check | http://localhost:5050/api/health |

> **Why 5050?** macOS often binds **5000** to AirPlay Receiver. Default API port is **5050**; frontend defaults to that via `VITE_API_URL` or the axios fallback.

---

## 6. Data models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, lowercase |
| passwordHash | String | never returned in JSON |
| role | enum | `fleet_manager` \| `driver` \| `safety_officer` \| `financial_analyst` |

### Vehicle
| Field | Type | Notes |
|-------|------|-------|
| registrationNumber | String | unique, uppercase |
| name | String | display name |
| type | enum | `van` \| `truck` \| `trailer` \| `car` |
| maxLoadCapacity | Number | kg; used in cargo validation |
| odometer | Number | updated on trip complete |
| acquisitionCost | Number | used in ROI |
| region | String | filterable on dashboard |
| status | enum | `available` \| `on_trip` \| `in_shop` \| `retired` |

### Driver (personnel record — not the login role)
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| licenseNumber | String | unique, uppercase |
| category | String | e.g. B, C, CE |
| licenseExpiry | Date | must be future to assign |
| contactNumber | String | optional |
| safetyScore | Number | 0–100 |
| status | enum | `available` \| `on_trip` \| `off_duty` \| `suspended` |

### Trip
| Field | Type | Notes |
|-------|------|-------|
| source / destination | String | route endpoints |
| vehicle / driver | ObjectId | refs |
| cargoWeight | Number | kg; ≤ capacity |
| plannedDistance | Number | km |
| finalOdometer | Number | set on complete |
| fuelConsumed | Number | liters; set on complete |
| revenue | Number | feeds ROI |
| status | enum | `draft` \| `dispatched` \| `completed` \| `cancelled` |

### MaintenanceLog
| Field | Type | Notes |
|-------|------|-------|
| vehicle | ObjectId | |
| type | String | e.g. Oil Change |
| cost | Number | |
| description | String | |
| openedAt / closedAt | Date | |
| status | enum | `open` \| `closed` |

### FuelLog
| Field | Type | Notes |
|-------|------|-------|
| vehicle | ObjectId | |
| liters / cost | Number | |
| date | Date | |
| odometer | Number | reading at fill |

### Expense
| Field | Type | Notes |
|-------|------|-------|
| vehicle | ObjectId | |
| category | enum | `toll` \| `maintenance` \| `other` |
| amount | Number | |
| date | Date | |
| note | String | |

---

## 7. Business rules engine

All five rules run on **trip create** (and again at dispatch via status checks):

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | Unique registration number | Mongo unique index + duplicate-key → clear API error |
| 2 | Retired / in-shop never dispatched | Rejected on create; `/vehicles/available` returns `status === 'available'` only |
| 3 | Expired license or suspended driver | Checked against `licenseExpiry` and `status` |
| 4 | No double-booking | Vehicle or driver already `on_trip` rejected |
| 5 | Cargo ≤ capacity | `cargoWeight > maxLoadCapacity` → `400` |

Additional guards in the status machine:

- Cannot dispatch unless both vehicle and driver are `available`
- Cannot complete without `finalOdometer` and `fuelConsumed`
- Final odometer cannot be less than current vehicle odometer
- Cannot open maintenance while `on_trip` or `retired`
- Off-duty drivers cannot be assigned

---

## 8. Status machine

Source of truth: `backend/src/utils/statusMachine.js`

### Trip transitions

```
          ┌──────────┐
          │  draft   │
          └────┬─────┘
       dispatch│    cancel
               ▼
          ┌──────────┐
          │dispatched│──────► cancelled
          └────┬─────┘
       complete│
               ▼
          ┌──────────┐
          │completed │  (terminal)
          └──────────┘
```

| Transition | Side effects |
|------------|--------------|
| `draft` → `dispatched` | Vehicle + driver → `on_trip` |
| `dispatched` → `completed` | Set odometer/fuel on trip; vehicle odometer updated; both → `available` |
| `dispatched` → `cancelled` | Vehicle + driver restored to `available` if they were `on_trip` |
| `draft` → `cancelled` | Trip cancelled; no asset restore needed |

### Maintenance

| Action | Vehicle status |
|--------|----------------|
| Open | → `in_shop` (drops out of dispatch pool) |
| Close | → `available` (skipped if `retired`) |

---

## 9. RBAC

### Permission matrix

| Capability | Fleet Manager | Dispatcher (`driver`) | Safety Officer | Financial Analyst |
|------------|:-------------:|:---------------------:|:--------------:|:-----------------:|
| Vehicles write | ✅ | — | — | — |
| Drivers write | ✅ | — | ✅ | — |
| Trips write (create/dispatch/complete/cancel) | — | ✅ | — | — |
| Maintenance write | ✅ | — | — | — |
| Fuel / expenses write | ✅ | ✅ | — | ✅ |
| Read most lists + reports | ✅ | ✅ | ✅* | ✅ |

\* Safety Officer has no Finance nav / write access.

### Backend enforcement

```js
// middleware/rbac.js — requireRole('fleet_manager', 'safety_officer')
// routes/index.js — applied per write route
```

### Frontend mirror

```js
// frontend/src/lib/rbac.js
can(role, 'vehicles_write')  // etc.
NAV_FOR_ROLE[role]           // which sidebar links to show
```

---

## 10. Application modules

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Product story, rules, roles, FAQ |
| `/login` | Login | Demo account entry |
| `/dashboard` | Dashboard | KPIs, utilization, status charts |
| `/vehicles` | Vehicles | CRUD + status management |
| `/drivers` | Drivers | CRUD, suspend, license tracking |
| `/trips` | Trips | Create, dispatch, complete, cancel |
| `/maintenance` | Maintenance | Open / close shop jobs |
| `/finance` | Finance | Fuel logs + expenses |
| `/reports` | Reports | Metrics table + CSV download |

Shared UI: `Layout`, `DataTable`, `Modal`, toast context, theme hook, format helpers.

---

## 11. API reference

**Base URL:** `http://localhost:5050/api`  
**Auth header:** `Authorization: Bearer <token>`  
**Health:** `GET /api/health` → `{ status: "ok", service: "transitops-api" }`

### Auth

| Method | Path | Auth | Body / notes |
|--------|------|------|--------------|
| `POST` | `/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| `POST` | `/auth/register` | Public* | Seed/admin style register |
| `GET` | `/auth/me` | JWT | Current user |

### Vehicles

| Method | Path | Roles |
|--------|------|-------|
| `GET` | `/vehicles` | Any authenticated |
| `GET` | `/vehicles/available` | Any authenticated |
| `POST` | `/vehicles` | `fleet_manager` |
| `PUT` | `/vehicles/:id` | `fleet_manager` |
| `DELETE` | `/vehicles/:id` | `fleet_manager` |

### Drivers

| Method | Path | Roles |
|--------|------|-------|
| `GET` | `/drivers` | Any authenticated |
| `GET` | `/drivers/available` | Any authenticated |
| `POST` | `/drivers` | `fleet_manager`, `safety_officer` |
| `PUT` | `/drivers/:id` | `fleet_manager`, `safety_officer` |
| `DELETE` | `/drivers/:id` | `fleet_manager`, `safety_officer` |

### Trips

| Method | Path | Roles | Notes |
|--------|------|-------|-------|
| `GET` | `/trips?status=` | Any authenticated | Optional status filter |
| `POST` | `/trips` | `driver` | Runs all five business rules |
| `POST` | `/trips/:id/dispatch` | `driver` | |
| `POST` | `/trips/:id/complete` | `driver` | Body: `{ finalOdometer, fuelConsumed }` |
| `POST` | `/trips/:id/cancel` | `driver` | |

**Create trip body example:**

```json
{
  "source": "Depot A",
  "destination": "Warehouse B",
  "vehicle": "<vehicleObjectId>",
  "driver": "<driverObjectId>",
  "cargoWeight": 450,
  "plannedDistance": 120,
  "revenue": 800
}
```

### Maintenance

| Method | Path | Roles |
|--------|------|-------|
| `GET` | `/maintenance` | Any authenticated |
| `POST` | `/maintenance` | `fleet_manager` |
| `POST` | `/maintenance/:id/close` | `fleet_manager` |

### Finance

| Method | Path | Roles |
|--------|------|-------|
| `GET` | `/fuel` | Any authenticated |
| `POST` | `/fuel` | `fleet_manager`, `driver`, `financial_analyst` |
| `GET` | `/expenses` | Any authenticated |
| `POST` | `/expenses` | `fleet_manager`, `driver`, `financial_analyst` |

### Dashboard & reports

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/dashboard/kpis` | Query: `type`, `status`, `region` |
| `GET` | `/reports` | JSON rows per vehicle |
| `GET` | `/reports/export.csv` | CSV download (`transitops-report.csv`) |

---

## 12. Reports & formulas

Per vehicle, the report builder aggregates completed trips, fuel logs, maintenance logs, and expenses:

| Metric | Formula / source |
|--------|------------------|
| Distance travelled | Σ `plannedDistance` of completed trips |
| Liters consumed | Σ trip `fuelConsumed` + Σ fuel-log liters |
| Fuel efficiency | `distanceTravelled / totalLiters` (km/L) |
| Fuel cost | Σ fuel-log costs |
| Maintenance cost | Σ maintenance log costs |
| Expense cost | Σ expense amounts |
| Operational cost | fuel + maintenance + expenses |
| Revenue | Σ completed trip revenue |
| ROI | `(revenue - (maintenanceCost + fuelCost)) / acquisitionCost` |

Dashboard **fleet utilization**:

```
utilization% = (vehicles on_trip / non-retired vehicles) × 100
```

---

## 13. Demo accounts & seed data

Run `npm run seed` after Mongo is up. Password for all users: **`password123`**

| UI label | Email | Role |
|----------|-------|------|
| Fleet Manager | `manager@transitops.dev` | `fleet_manager` |
| Dispatcher | `dispatcher@transitops.dev` | `driver` |
| Safety Officer | `safety@transitops.dev` | `safety_officer` |
| Financial Analyst | `finance@transitops.dev` | `financial_analyst` |

### Seeded fleet (highlights)

| Reg | Type | Capacity | Status | Notes |
|-----|------|----------|--------|-------|
| VAN-05 | van | 500 kg | available | Happy-path demo unit |
| TRK-11 | truck | 12,000 kg | available | Has completed trip history |
| TRL-02 | trailer | 24,000 kg | available | Draft trip ready to dispatch |
| CAR-08 | car | 300 kg | in_shop | Open brake maintenance |
| VAN-09 | van | 650 kg | available | |
| TRK-20 | truck | 15,000 kg | retired | Must never appear in dispatch |

### Seeded drivers (highlights)

| Name | License | Status | Notes |
|------|---------|--------|-------|
| Alex Rivera | DL-1001 | available | Valid — use for happy path |
| Bianca Cole | DL-1002 | available | |
| Carl Ndlovu | DL-1003 | available | **Expired license** — reject on assign |
| Dana Fischer | DL-1004 | suspended | **Suspended** — reject on assign |
| Evan Park | DL-1005 | available | On completed seed trip |

Also seeded: one completed trip, one draft trip, open + closed maintenance, fuel fills, toll/parking expenses.

---

## 14. Quick start

### Prerequisites

- **Node.js 18+**
- **MongoDB** listening on `mongodb://127.0.0.1:27017`  
  (or set `MONGODB_URI` to Atlas / another host)

Local Mongo without a service:

```bash
mkdir -p .mongo-data
mongod --dbpath ./.mongo-data --port 27017
```

### Install → seed → run

```bash
# from repo root
npm run install:all
npm run seed
npm run dev
```

Then open **http://localhost:5173** → **Get started** → log in with a demo account.

### Run separately

```bash
npm run dev:backend    # http://localhost:5050
npm run dev:frontend   # http://localhost:5173
```

### Production-style

```bash
npm run build:frontend
npm run start:backend
npm run start:frontend   # vite preview
```

---

## 15. Environment variables

### `backend/.env`

```env
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/transitops
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5000` in code / use `5050` locally | API listen port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/transitops` | Database |
| `JWT_SECRET` | required for signed tokens | Signing key |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_ORIGIN` | `true` (reflect) | CORS origin |

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5050/api
```

If unset, the client falls back to `http://localhost:5050/api`.

---

## 16. npm scripts

### Root (`package.json`)

| Script | What it does |
|--------|----------------|
| `install:all` | Install root + backend + frontend deps |
| `seed` | Wipe collections & insert demo data |
| `dev` | Backend + frontend together via concurrently |
| `dev:backend` / `dev:frontend` | Individual dev servers |
| `start:backend` / `start:frontend` | Production-ish start / Vite preview |
| `build:frontend` | `vite build` |
| `build:backend` | No-op (plain Node) |

### Backend

| Script | Command |
|--------|---------|
| `dev` | `nodemon src/server.js` |
| `start` | `node src/server.js` |
| `seed` | `node src/seed.js` |

### Frontend

| Script | Command |
|--------|---------|
| `dev` | Vite (with nodemon watching config) |
| `build` | `vite build` |
| `start` / `preview` | `vite preview` |

---

## 17. Project structure

```
oodo-hack/
├── package.json                 # monorepo scripts
├── README.md
├── .gitignore
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js            # Mongo connect + listen (+ DNS fix)
│       ├── app.js               # Express app, /api, health, errors
│       ├── seed.js              # Demo dataset
│       ├── models/
│       │   ├── User.js
│       │   ├── Vehicle.js
│       │   ├── Driver.js
│       │   ├── Trip.js
│       │   ├── MaintenanceLog.js
│       │   ├── FuelLog.js
│       │   └── Expense.js
│       ├── routes/index.js      # All REST routes + RBAC
│       ├── controllers/         # auth, vehicle, driver, trip, …
│       ├── middleware/
│       │   ├── auth.js          # JWT verify
│       │   ├── rbac.js          # requireRole
│       │   └── errorHandler.js
│       └── utils/
│           ├── statusMachine.js # Trip + maintenance transitions
│           ├── csv.js           # Hand-rolled CSV builder
│           └── ApiError.js
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── public/logo.svg
    └── src/
        ├── main.jsx
        ├── App.jsx              # Routes + Protected layout
        ├── index.css
        ├── api/
        │   ├── client.js        # Axios + JWT header
        │   └── endpoints.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── DataTable.jsx
        │   ├── Modal.jsx
        │   ├── Logo.jsx
        │   └── ui.jsx
        ├── hooks/
        ├── lib/
        │   ├── rbac.js
        │   ├── constants.js
        │   └── format.js
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Vehicles.jsx
            ├── Drivers.jsx
            ├── Trips.jsx
            ├── Maintenance.jsx
            ├── Finance.jsx
            └── Reports.jsx
```

---

## 18. End-to-end demo script

Use after `npm run seed`. Suggested login: **Dispatcher** for trips, **Fleet Manager** for vehicles/maintenance.

1. **Login** as `dispatcher@transitops.dev` / `password123`.
2. Open **Trips** — confirm draft trip Depot A → Port C exists (TRL-02 / Alex).
3. **Dispatch** that draft → TRL-02 and Alex become `on_trip`.
4. **Complete** with a final odometer ≥ current and fuel liters → both return `available`.
5. Switch to **Fleet Manager** (`manager@transitops.dev`).
6. Open **Maintenance** on VAN-05 (Oil Change) → status `in_shop`.
7. Confirm VAN-05 no longer appears in trip vehicle picker / available list.
8. Close the maintenance job → VAN-05 `available` again.
9. Open **Reports** — distance, op cost, ROI update; download CSV.
10. Open **Finance** — add a fuel log or toll expense; refresh reports.

Optional vehicle path: create `VAN-99` (500 kg), create a 450 kg trip with a valid driver, dispatch, complete — mirrors the Section-8 happy path.

---

## 19. Negative test cases

These should all return **400** (or be blocked in the UI):

| Attempt | Expected |
|---------|----------|
| Assign Carl (expired license) to a trip | Rejected |
| Assign Dana (suspended) to a trip | Rejected |
| Cargo 600 kg on VAN-05 (500 kg cap) | Rejected |
| Assign CAR-08 (`in_shop`) or TRK-20 (`retired`) | Rejected |
| Dispatch second trip on an `on_trip` asset | Rejected |
| Complete trip without odometer/fuel | Rejected |
| Final odometer lower than current | Rejected |
| Duplicate registration number | Rejected |
| Safety Officer opens Finance write UI | Hidden / denied |
| Financial Analyst creates a vehicle | 403 |

---

## 20. Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` Mongo | Start `mongod`, or fix `MONGODB_URI` |
| `querySrv ECONNREFUSED` (Atlas) | Repo already sets DNS to `8.8.8.8` / `1.1.1.1`; check network / URI |
| Frontend calls wrong port | Set `frontend/.env` → `VITE_API_URL=http://localhost:5050/api` |
| Port 5000 busy (macOS) | Use `PORT=5050` in backend `.env` |
| Empty app after clone | Run `npm run seed` |
| 401 on every request | Re-login; token expired or missing `JWT_SECRET` |
| CORS errors | Set `CLIENT_ORIGIN=http://localhost:5173` |

---

## License

Built for the **Odoo Hackathon**. All rights reserved by the project authors unless otherwise stated.
