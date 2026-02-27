

# GPS Vehicle Tracking System

A production-ready, scalable GPS Vehicle Tracking backend built with **Node.js**, **Express**, **Socket.IO**, and **MongoDB (GeoJSON)**. Designed for real-time ingestion of GPS coordinates, live tracking, trip management, geofencing, alerts, and analytics — ready to pair with a Google Maps or Mapbox frontend.

> Based on the requirement document.


## Table of contents

* [Overview](#overview)
* [Key features](#key-features)
* [Architecture](#architecture)
* [Tech stack](#tech-stack)
* [Repository structure](#repository-structure)
* [Quickstart (local)](#quickstart-local)
* [Environment variables](#environment-variables)
* [Database schemas](#database-schemas)
* [APIs (REST)](#apis-rest)
* [Socket events (Realtime)](#socket-events-realtime)
* [Trip detection logic](#trip-detection-logic)
* [Geofence logic](#geofence-logic)
* [Performance & scaling](#performance--scaling)
* [Security](#security)
* [Deployment notes (AWS)](#deployment-notes-aws)
* [Monitoring & logging](#monitoring--logging)
* [Testing](#testing)
* [Next steps / Enhancements](#next-steps--enhancements)

---

## Overview

This project provides a backend that:

* Accepts GPS data (REST or WebSocket)
* Stores time-series geolocation (GeoJSON) efficiently
* Broadcasts live locations to web/mobile clients using Socket.IO
* Detects trips, overspeed, idle, and geofence events
* Supports historical playback and downloadable reports

Designed to handle thousands of concurrent devices with low latency.

---

## Key features

* Device authentication (API keys)
* REST + WebSocket ingestion endpoints
* Real-time location broadcast (Socket.IO)
* Trip lifecycle: start / end / distance / duration
* Geofencing (circle + polygon) with entry/exit alerts
* Alerts: overspeed, idle, device-offline
* Historical route playback & exportable CSV
* RBAC for admin/fleet roles
* MongoDB GeoJSON & index optimizations
* Redis for caching / pub-sub / rate-limiting (optional)

---

## Architecture (high-level)

```
[GPS Device] --HTTP/Socket--> [Ingress API (Express)] --> [Real-time Engine (Socket.IO)]
                                                           |
                                                           v
                                                      [MongoDB (GeoJSON)]
                                                           |
                                                           v
                                           [Workers] --> [Analytics / Reports]
                                                           |
                           [Admin Web / Mobile App] <---- Socket updates / REST
```

* Ingress API receives device data and validates/authenticates.
* Real-time Engine broadcasts to subscribed clients (rooms by `vehicleId` or `fleetId`).
* Location logs stored in MongoDB with GeoJSON points.
* Background workers (Bull/Redis) handle heavy analytics, aggregation, and alerts.

---

## Tech stack

* **Language:** Node.js (>=18), JavaScript (ES Modules or CommonJS)
* **Web framework:** Express.js
* **Realtime:** Socket.IO
* **DB:** MongoDB (use replica set for production; GeoJSON indexes)
* **Cache / jobs:** Redis (caching, rate-limiting, pub-sub, Bull for background jobs)
* **Maps:** Google Maps JS API (frontend), Mapbox optional
* **Deploy:** Docker, AWS EC2, Nginx, PM2
* **Monitoring:** Prometheus + Grafana or services like Datadog / Sentry
* **Auth:** JWT for users; API key / HMAC for devices

---

## Repository structure (recommended)

```
/src
  /api
    device.controller.js
    vehicle.controller.js
    geofence.controller.js
    report.controller.js
  /services
    tracking.service.js
    trip.service.js
    geofence.service.js
    alert.service.js
  /sockets
    index.js
    vehicle.socket.js
  /models
    Vehicle.js
    LocationLog.js
    Trip.js
    Geofence.js
    User.js
  /workers
    analytics.worker.js
    alerts.worker.js
  /utils
    haversine.js
    geojson.js
    rateLimiter.js
  app.js
  server.js
/config
  default.json (or use dotenv)
scripts/
  device-simulator.js
Dockerfile
docker-compose.yml
README.md
```

---

## Quickstart (local)

### Prerequisites

* Node.js (18+)
* MongoDB (local or Atlas)
* Redis (for job queue / caching)
* Google Maps API key (for frontend / geocoding)

### Install & run

```bash
git clone <repo>
cd repo
npm install

# create .env (see below)
cp .env.example .env

# run locally
npm run dev   # or: node src/server.js
```

---

## Environment variables (`.env` example)

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/gps_tracking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
DEVICE_API_KEY_SECRET=your_device_secret
GOOGLE_MAPS_API_KEY=AIza...
NODE_ENV=development
SOCKET_IO_PATH=/socket.io
```

---

## Database schemas (high-level)

### Vehicle

```js
{
  _id: ObjectId,
  vehicleId: String, // unique
  deviceId: String,
  fleetId: ObjectId,
  status: String, // active/offline
  meta: { make, model, regNo },
  lastLocation: { type: "Point", coordinates: [lng, lat] },
  lastSeenAt: Date
}
```

### LocationLog

```js
{
  _id: ObjectId,
  vehicleId: String,
  location: { type: "Point", coordinates: [lng, lat] },
  speed: Number,
  heading: Number,
  altitude: Number,
  timestamp: Date,
  rawPayload: Object
}
```

* Index: `location` as 2dsphere, `vehicleId + timestamp` compound index.
* Use capped or TTL collections or archive older data to cheaper storage.

### Trip

```js
{
  _id: ObjectId,
  tripId: String,
  vehicleId: String,
  driverId: String,
  startTime: Date,
  endTime: Date,
  distanceMeters: Number,
  avgSpeed: Number,
  maxSpeed: Number,
  routeSummary: [{ lng, lat, ts }] // compressed (polyline) recommended
}
```

### Geofence

```js
{
  _id: ObjectId,
  name: String,
  type: "circle" | "polygon",
  shape: { center, radius } | { type: "Polygon", coordinates: [...] },
  assignedVehicles: [vehicleId],
  notifyOn: ["enter","exit"]
}
```

---

## API (REST) — examples

> Base URL: `https://api.example.com/api`

### 1) POST `/api/device/location` — Ingest location (device -> server)

**Headers:** `x-device-key: <API_KEY>`

**Body**

```json
{
  "deviceId": "dev-001",
  "vehicleId": "veh-123",
  "lat": 28.6139,
  "lng": 77.2090,
  "speed": 45,
  "heading": 120,
  "timestamp": "2026-02-27T08:25:00Z"
}
```

**Response**

```json
{ "success": true, "saved": true }
```

**Server action**

* Validate device API key.
* Save to `LocationLog`.
* Update `Vehicle.lastLocation` and `lastSeenAt`.
* Push to Socket.IO room `vehicle:veh-123`.
* Enqueue analytics worker for trip/alert checks.

### 2) GET `/api/vehicle/live?vehicleId=veh-123`

**Response**

```json
{
  "vehicleId": "veh-123",
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "speed": 45,
  "lastSeenAt": "..."
}
```

### 3) GET `/api/vehicle/history?vehicleId=veh-123&from=...&to=...`

* Returns compressed route or paginated location points.

### 4) POST `/api/geofence` — create geofence (admin)

**Body**

```json
{
  "name": "Warehouse",
  "type": "circle",
  "center": [77.2100, 28.6140],
  "radiusMeters": 200,
  "assignedVehicles": ["veh-123"]
}
```

### 5) GET `/api/reports/trip?vehicleId=veh-123&from=...&to=...`

* CSV/JSON of trips.

---

## Socket.IO (Realtime) — events

### Connection

```js
const io = require('socket.io')(server, { path: process.env.SOCKET_IO_PATH });

io.on('connection', socket => {
  // authenticate (JWT or token)
  // join rooms like `fleet:<fleetId>`, `vehicle:<vehicleId>`
});
```

### Events (server -> client)

* `location:update` — emits `{ vehicleId, lat, lng, speed, ts }`
* `trip:start` — `{ tripId, vehicleId, startTime }`
* `trip:end` — `{ tripId, vehicleId, endTime, distance }`
* `geofence:event` — `{ vehicleId, geofenceId, type: "enter"|"exit" }`
* `alert` — `{ vehicleId, type: "overspeed"|"idle"|"offline", details }`

### Events (client -> server)

* `subscribe` — `{ vehicleIds: [], fleetIds: [] }`
* `unsubscribe` — `{ vehicleIds: [] }`

**Socket rooms:** use `vehicle:<vehicleId>` and `fleet:<fleetId>` to scale messages.

---

## Trip detection logic (practical)

Trip detection can be tuned; a simple robust approach:

1. **Trip start**

   * When device speed > `MIN_MOVING_SPEED` (e.g., 3 km/h) for `N` consecutive points (e.g., 3 points within 30s).
   * Create `Trip` with `startTime` and initial point.

2. **Trip end**

   * When speed < `MIN_MOVING_SPEED` for `M` consecutive points (e.g., 4 points over 2 minutes) or device stationary beyond `IDLE_THRESHOLD`.
   * Mark `endTime`, calculate distance & duration.

3. **Distance calculation**

   * Use Haversine formula (or libraries) between consecutive coordinates and sum.
   * For efficiency, perform on worker (not inline) for batch points.

4. **Edge cases**

   * Short trips under `MIN_TRIP_DURATION` may be merged or discarded.
   * Handle clock skew by trusting server-received timestamp if device time unreliable.

---

## Geofence detection (practical)

* For polygon geofence, use point-in-polygon algorithm (ray casting) or GeoJSON `$geoIntersects` on Mongo queries.
* For circular geofence: compute distance from center (Haversine) <= radius.
* Strategy:

  1. Upon ingest, run quick geofence checks for assigned geofences.
  2. If change from previous state (outside → inside), emit `geofence:event` enter.
  3. Persist geofence events for audit.

**Optimization:** only check geofences assigned to the vehicle (store index mapping) to avoid checking all geofences every point.

---

## Performance & scaling (practical)

### Ingestion throughput

* Accept batched points from devices (e.g., array of 10 location points) to reduce DB writes.
* Use MongoDB bulk inserts for LocationLog.

### Socket load

* Use namespaces and rooms. For heavy scale:

  * Run Socket.IO cluster with Redis adapter for pub-sub.
  * Use sticky sessions at load balancer (or use WebSocket-compatible proxy + socket clustering).

### Storage

* Archive older raw points to cheaper storage (S3) after aggregation.
* Keep recent N days in hot DB.

### Caching

* Redis for frequently requested live vehicle state.

### Workers

* Use job queue (BullMQ) for processing trips, generating reports, and heavy calculations.

---

## Security (practical)

* Device authentication using signed API key / HMAC per-device.
* TLS (HTTPS) for all ingestion endpoints and sockets (WSS).
* JWT for admin/user APIs.
* Rate-limiting per device (requests/min).
* Role-based access control (Admin, Fleet Admin, Viewer).
* Audit logs for critical actions.

---

## Deployment notes (AWS)

* Use ECS / EKS or EC2 + PM2 for process management.
* Use Nginx as reverse proxy & SSL termination.
* Use MongoDB Atlas or self-managed replica set.
* Use Redis (ElastiCache).
* Use S3 for archived route data.
* Use CI/CD (GitHub Actions) to build & deploy Docker images.
* Use autoscaling groups behind ALB (WebSocket support via sticky sessions or use AWS AppSync/managed websockets).

---

## Monitoring & logging

* Centralized logs (ELK / Loki).
* Metrics: requests/sec, socket connections, ingestion latency, queue size.
* Alerts: ingestion backlog growth, worker failures, DB replication lag.

---

## Testing

* Unit tests: jest/mocha for services (trip logic, geofence).
* Integration tests: spin up MongoDB + Redis via docker-compose.
* Load tests: k6 / Artillery to simulate thousands of devices sending points.
* E2E: device-simulator + frontend map.

---

## Device simulator (quick)

Create `scripts/device-simulator.js` to simulate a device sending points via HTTP or Socket.IO — great for demos and load testing.

```js
// pseudocode example
const axios = require('axios');

async function sendPoint() {
  await axios.post('http://localhost:4000/api/device/location', {
    deviceId: 'dev-1',
    vehicleId: 'veh-1',
    lat: 28.6139 + (Math.random()-0.5)/1000,
    lng: 77.2090 + (Math.random()-0.5)/1000,
    speed: Math.floor(Math.random()*60),
    timestamp: new Date().toISOString()
  }, {
    headers: { 'x-device-key': process.env.DEVICE_API_KEY }
  });
}
setInterval(sendPoint, 5000);
```

---

## Example cURL

```bash
curl -X POST "http://localhost:4000/api/device/location" \
  -H "Content-Type: application/json" \
  -H "x-device-key: DEV_KEY_123" \
  -d '{
    "deviceId":"dev-001",
    "vehicleId":"veh-123",
    "lat":28.6139,
    "lng":77.2090,
    "speed":50,
    "timestamp":"2026-02-27T08:25:00Z"
  }'
```

---

## Frontend (Google Maps) — live marker update (snippet)

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>
<script src="/socket.io/socket.io.js"></script>
<script>
  const map = new google.maps.Map(document.getElementById('map'), { center: {lat:28.61,lng:77.20}, zoom:12 });
  const socket = io('https://api.example.com', { path: '/socket.io' });

  socket.on('connect', () => {
    socket.emit('subscribe', { vehicleIds: ['veh-123'] });
  });

  const markers = {};
  socket.on('location:update', data => {
    const { vehicleId, lat, lng } = data;
    if (!markers[vehicleId]) {
      markers[vehicleId] = new google.maps.Marker({ map, position: {lat, lng} });
    } else {
      markers[vehicleId].setPosition(new google.maps.LatLng(lat, lng));
    }
  });
</script>
```