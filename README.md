

# 🚗 GPS Vehicle Tracking System (Backend)

A **production-ready GPS Vehicle Tracking backend** built using **Node.js, Express, Socket.IO, MongoDB (GeoJSON)** following **clean modular routing architecture** for **fleet-scale systems**.

This system supports **real-time GPS ingestion**, **live tracking**, **trip analytics**, **geofencing**, **alerts**, and **role-based dashboards** (User / Fleet Admin / Super Admin).

---

## 📌 Core Design Principles

* Clean **route separation**
* Strict **role-based access control (RBAC)**
* **Controllers = business logic only**
* **Routes = request orchestration only**
* Designed for **10,000+ vehicles**
* Optimized for **Google Maps frontend**

---

## 🧱 High-Level Architecture

```
Client / GPS Device
        ↓
    Express Router
        ↓
   Role-based Routes
        ↓
    Controllers
        ↓
     Services
        ↓
 MongoDB / Redis
        ↓
 Socket.IO (Live)
```

---

## 🗂️ Folder Structure (FINAL – Production Ready)

```
src/
│
├── server.js
├── app.js
│
├── routes/
│   ├── index.js
│   │
│   ├── user/
│   │   ├── user.routes.js
│   │   └── user.controller.js
│   │
│   ├── fleet/
│   │   ├── fleet.routes.js
│   │   ├── vehicles.routes.js
│   │   ├── tracking.routes.js
│   │   ├── trips.routes.js
│   │   ├── geofence.routes.js
│   │   └── reports.routes.js
│   │
│   ├── admin/
│   │   ├── admin.routes.js
│   │   └── admin.controller.js
│   │
│   └── device/
│       └── device.routes.js
│
├── controllers/
│   ├── vehicle.controller.js
│   ├── tracking.controller.js
│   ├── trip.controller.js
│   ├── geofence.controller.js
│   ├── report.controller.js
│   └── device.controller.js
│
├── services/
│   ├── tracking.service.js
│   ├── trip.service.js
│   ├── geofence.service.js
│   └── alert.service.js
│
├── models/
│   ├── User.js
│   ├── Vehicle.js
│   ├── LocationLog.js
│   ├── Trip.js
│   └── Geofence.js
│
├── sockets/
│   └── index.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── rateLimiter.middleware.js
│
├── utils/
│   ├── haversine.js
│   └── geo.js
│
└── config/
    └── db.js
```

---

## 🔑 Routing Philosophy

✔ No business logic in routes
✔ Single responsibility per route
✔ Fleet routes internally modular
✔ Device routes fully isolated
✔ RBAC enforced at routing layer

---

## 🌐 Main Router (`routes/index.js`)

```js
const router = require('express').Router();

router.use('/user', require('./user/user.routes'));
router.use('/fleet', require('./fleet/fleet.routes'));
router.use('/admin', require('./admin/admin.routes'));
router.use('/device', require('./device/device.routes'));

module.exports = router;
```

---

## 🚚 Fleet Routing (Nested)

`routes/fleet/fleet.routes.js`

```js
const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.use(auth, role('FLEET_ADMIN'));

router.use('/vehicles', require('./vehicles.routes'));
router.use('/tracking', require('./tracking.routes'));
router.use('/trips', require('./trips.routes'));
router.use('/geofence', require('./geofence.routes'));
router.use('/reports', require('./reports.routes'));

module.exports = router;
```

---

## 📡 Device Route (GPS Hardware)

```js
router.post('/location', limiter, ctrl.ingestLocation);
```

* Rate-limited
* Device API-key authenticated
* Optimized for high-frequency GPS pings

---

# 🧩 Database Schema Design (MOST IMPORTANT)

All schemas are **GPS-industry standard**, **GeoJSON-optimized**, and **scalable**.

---

## 👤 User Schema (`models/User.js`)

```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ['USER', 'FLEET_ADMIN', 'SUPER_ADMIN']
  },

  fleetId: ObjectId, // nullable

  status: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE'
  },

  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚚 Vehicle Schema (`models/Vehicle.js`)

```js
{
  vehicleId: { type: String, unique: true },
  fleetId: ObjectId,

  deviceId: String,
  registrationNumber: String,
  vehicleType: String,

  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'OFFLINE']
  },

  lastLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },

  lastSpeed: Number,
  lastSeenAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

* `vehicleId`
* `fleetId`
* `lastLocation (2dsphere)`

---

## 📍 Location Log Schema (`models/LocationLog.js`)

```js
{
  vehicleId: String,
  fleetId: ObjectId,

  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  },

  speed: Number,
  heading: Number,
  altitude: Number,
  ignitionOn: Boolean,

  recordedAt: Date,   // device time
  receivedAt: Date   // server time
}
```

Indexes:

* `{ vehicleId, recordedAt }`
* `location (2dsphere)`
* TTL (optional archival)

---

## 🧭 Trip Schema (`models/Trip.js`)

```js
{
  tripId: String,
  vehicleId: String,
  fleetId: ObjectId,

  startTime: Date,
  endTime: Date,

  startLocation: { type: 'Point', coordinates: [Number] },
  endLocation: { type: 'Point', coordinates: [Number] },

  distanceMeters: Number,
  durationSeconds: Number,

  avgSpeed: Number,
  maxSpeed: Number,

  status: { type: String, enum: ['ONGOING', 'COMPLETED'] },

  createdAt: Date
}
```

---

## 📐 Geofence Schema (`models/Geofence.js`)

```js
{
  fleetId: ObjectId,
  name: String,

  type: {
    type: String,
    enum: ['CIRCLE', 'POLYGON']
  },

  center: [Number],       // for circle
  radiusMeters: Number,  // for circle

  polygon: {
    type: { type: String, enum: ['Polygon'] },
    coordinates: []
  },

  assignedVehicles: [String],
  notifyOn: ['ENTER', 'EXIT'],

  createdAt: Date
}
```

---

## ⚙️ server.js

```js
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets');

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT || 4000);
```

---

