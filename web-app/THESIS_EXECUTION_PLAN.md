# Thesis Execution Plan - LoRaWAN Smart Utility Monitoring

Last updated: 2026-06-01

## Current State

The project is a working MVP, not a scaffold.

Completed pieces:

1. Docker infrastructure for Postgres, InfluxDB, Redis, Mosquitto, ChirpStack, ChirpStack Gateway Bridge, and LWN-Simulator.
2. Prisma/PostgreSQL relational model for users, customer type, device metadata, ownership, utility type, tariffs, and coordinates.
3. MQTT worker that subscribes to ChirpStack uplinks and writes normalized meter readings to InfluxDB.
4. Authenticated Next.js API layer for auth, device CRUD, telemetry reads, billing, SSE streaming, and fleet summary.
5. Dashboard UI with auth flow, overview, devices, meter, billing, and integrated map mode in the overview page.
6. Development command `npm run dev:all` that starts both the Prisma-aware Next.js dev server and the MQTT worker.
7. Claim-code assignment flow for company and individual customer accounts.
8. Demo provisioning script that creates 50 generated devices across LWN-Simulator, ChirpStack, and the app database.

Current next major feature:

1. Phase 7 predictive module: forecasting service, forecast endpoint, and predicted-vs-observed dashboard visualization.

## Core Invariants

These must remain true:

1. InfluxDB stores telemetry and time-series only.
2. PostgreSQL stores relational metadata only.
3. No sensor readings are stored in Prisma models.
4. `Device.devEui` is the canonical bridge key across ChirpStack, MQTT payloads, InfluxDB, and the frontend.
5. Billing is computed from PostgreSQL tariff metadata and InfluxDB consumption data:
   `estimatedCost = consumedUnits * tariffPerUnit`.
6. User ownership must be enforced before device metadata, telemetry, billing, or SSE data is returned.
7. ChirpStack may provide device inventory metadata, but the app database remains the source of truth for business ownership.

## Current Data Model

Relational schema:

1. `User`
   - UUID `id`
   - unique `email`
   - `passwordHash`
   - `firstName`
   - `lastName`
   - `role`: `ADMIN` or `CUSTOMER`
   - nullable `customerType`: `INDIVIDUAL` or `COMPANY`
   - one-to-many relation to `Device`
2. `Device`
   - UUID `id`
   - unique `devEui`
   - `name`
   - `utilityType`: `ELECTRICITY`, `GAS`, `WATER`, `HEATING`, `COOLING`, `OTHER`
   - `tariffPerUnit`
   - `unitLabel`
   - `isActive`
   - optional `latitude` and `longitude`
   - optional `userId` owner relation
   - optional `claimCodeHash`
   - optional `claimCodeLabel`
   - optional `claimCodeCustomerType`
   - optional `claimedAt`

Note: `OTHER` remains only as a legacy defensive enum fallback. The current app options and demo fleet use the real meter categories: electricity, gas, water, heating, and cooling.

Telemetry schema:

1. Influx measurement: `meter_reading`
2. Primary tag: `devEui`
3. Optional tag: `utilityType`
4. Fields currently supported by the app:
   - `consumption`
   - `energy`
   - `voltage`
   - `current`

## Runtime Architecture

Infrastructure:

1. `docker-compose.yml` starts the local LoRaWAN stack and databases.
2. LWN-Simulator sends simulated LoRaWAN packets to the ChirpStack Gateway Bridge.
3. ChirpStack publishes decoded uplinks to Mosquitto MQTT.
4. ChirpStack stores import metadata in `device.tags` and `device.variables`.
5. `mqtt-worker/index.ts` consumes MQTT uplinks and writes meter readings to InfluxDB.
6. Next.js imports ChirpStack inventory metadata into PostgreSQL through `syncChirpStackInventory`.
7. Next.js reads PostgreSQL through Prisma and reads telemetry through the InfluxDB client.
8. Browser UI consumes only authenticated Next.js APIs and SSE.

Development command:

```powershell
docker compose up -d
cd web-app
npm run dev:all
```

`npm run dev:all` runs:

1. `npm run dev:web`
   - executes `node scripts/dev-with-prisma.mjs`
   - generates Prisma Client before starting Next.js
   - restarts Next.js when Prisma schema/migrations change
2. `npm run worker`
   - executes `ts-node mqtt-worker/index.ts`
   - subscribes to `application/+/device/+/event/up`

Demo provisioning command:

```powershell
npm run provision:demo-devices
```

This script uses the LWN-Simulator HTTP API and direct local ChirpStack PostgreSQL writes. Direct ChirpStack DB writes are acceptable here as a local thesis provisioning shortcut because the local ChirpStack HTTP API is not exposed for this setup. For production, ChirpStack devices should be managed through ChirpStack's supported API.

## Implemented API Surface

Auth:

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/auth/me`
4. `POST /api/auth/logout`

Devices:

1. `GET /api/devices`
2. `POST /api/devices`
3. `POST /api/devices/claim`
4. `GET /api/devices/[devEui]`
5. `PATCH /api/devices/[devEui]`
6. `DELETE /api/devices/[devEui]`

Telemetry and billing:

1. `GET /api/devices/[devEui]/readings`
2. `GET /api/devices/[devEui]/cost`
3. `GET /api/devices/summary`
4. `GET /api/devices/stream`

## Implemented UI Surface

Routes:

1. `/` redirects to `/home`
2. `/home` shows overview and map mode
3. `/devices` manages inventory, filters, creation, and editing
4. `/meter` shows selected-device live readings, chart, and billing details
5. `/billing` shows selected-device and fleet cost summaries

Current navigation items:

1. Overview
2. Devices
3. Meter
4. Billing

The standalone `/map` route was removed by the latest pulled commit. Map functionality now lives inside the overview page as a mode.

## Verification Status

Verified on 2026-06-01:

1. `npm run lint` passes.
2. `npx tsc --noEmit` passes.
3. `npx prisma generate` passes.
4. `npx prisma migrate status` reports the local database schema is up to date.
5. Pending migration `20260510120000_add_customer_type` was applied locally.
6. `npm run dev:all` launches successfully.
7. `http://localhost:3000` responds with `200`.
8. `GET /api/auth/me` responds with `401` without a session, as expected.
9. `20260601143000_add_device_claim_metadata` was applied locally.
10. `npm run provision:demo-devices` provisioned 50 devices and is idempotent on rerun.
11. `npm run lint` and `npx tsc --noEmit` pass after the claim-code and provisioning changes.

Known local database state from the last inspection:

1. Demo company user owns 35 generated devices.
2. Three demo individual users own 5 generated devices each.
3. Demo utility distribution is 10 electricity, 10 gas, 10 water, 10 heating, and 10 cooling devices.
4. ChirpStack contains matching demo metadata in `device.tags` and `device.variables`.
5. InfluxDB had `meter_reading` data, but fresh ingestion must be confirmed during the next simulator demo.

## Completed Roadmap

### Phase 1 - Baseline and Migration Alignment

Status: completed.

Delivered:

1. Prisma schema validation and migration alignment.
2. UUID primary keys.
3. `Role` enum with `ADMIN` and `CUSTOMER`.
4. Unique `Device.devEui`.
5. Required user-device ownership relation.

### Phase 2 - Backend Foundation

Status: completed.

Delivered:

1. Prisma singleton and PostgreSQL adapter setup.
2. Password hashing.
3. JWT signing and verification.
4. Auth APIs.
5. Request validation.
6. Shared API response helpers.
7. Protected API proxy/middleware behavior.

### Phase 3 - Device Metadata and Ownership APIs

Status: completed.

Delivered:

1. Device validation and `devEui` normalization.
2. Authenticated device CRUD.
3. Ownership-safe access checks.
4. Simulator device discovery and auto-provisioning support.

### Phase 4 - Influx Read APIs and Billing

Status: completed.

Delivered:

1. Latest, range, and aggregated telemetry reads.
2. Cost endpoint using `tariffPerUnit` and Influx consumption.
3. Fleet summary aggregation by utility category.

### Phase 5 - Real-Time Updates

Status: completed.

Delivered:

1. Authenticated SSE endpoint.
2. Client SSE hook.
3. Live device status and selected-meter updates in the dashboard.

### Phase 6 - Dashboard Delivery

Status: completed.

Delivered:

1. Auth-first dashboard shell.
2. Overview with fleet summary and map mode.
3. Device inventory and metadata editing.
4. Meter detail view.
5. Billing view.
6. Logout flow.
7. Customer type selection in registration.

### Dev Flow Patch - 2026-06-01

Status: completed.

Delivered:

1. Resolved cloud-pull conflict in `package.json`.
2. Preserved Prisma-aware dev script from `scripts/dev-with-prisma.mjs`.
3. Restored `worker` and `dev:all` scripts.
4. Regenerated Prisma Client after `CustomerType` schema change.
5. Applied `20260510120000_add_customer_type`.
6. Removed stale `.next` generated route types from the old standalone map route.

### Claim-Code And Demo Fleet Patch - 2026-06-01

Status: completed.

Delivered:

1. Added nullable device ownership so imported devices can exist before claim assignment.
2. Added claim-code metadata fields to `Device`.
3. Added registration-time claim-code support.
4. Added `POST /api/devices/claim` for already registered users.
5. Added ChirpStack inventory metadata sync from `device.tags` and `device.variables`.
6. Added `scripts/provision-demo-devices.mjs` and `npm run provision:demo-devices`.
7. Provisioned 50 generated demo devices near the original simulator device location.
8. Split generated devices as 7 company and 3 individual devices per utility type.
9. Mirrored metadata into ChirpStack tags/variables while keeping app ownership in PostgreSQL.

## Remaining Roadmap

### Phase 7 - Predictive Module

Status: next.

Required:

1. Decide forecasting implementation strategy.
2. Add service that reads historical Influx data and creates forecast points.
3. Expose forecast endpoint, likely `GET /api/devices/[devEui]/forecast`.
4. Add validation for forecast horizon, window, and aggregation.
5. Add predicted-vs-observed visualization in the meter view.
6. Document the forecasting method clearly for thesis use.

Pragmatic implementation note:

1. A full ARIMA implementation in TypeScript may add risk.
2. A thesis-safe path is to implement a clear forecasting module with documented assumptions, then call it ARIMA-style only if the method genuinely matches ARIMA behavior.
3. If strict ARIMA is required, consider isolating forecasting in a Python service or using a proven package rather than hand-rolling math.

### Phase 8 - Hardening and Thesis Evidence

Status: not started.

Required:

1. Add regression tests for ownership isolation.
2. Add billing correctness tests.
3. Add telemetry query tests.
4. Add SSE reconnect/stream tests.
5. Capture evidence:
   - Docker container status
   - ChirpStack configuration screenshots
   - MQTT worker logs
   - Influx queries
   - API responses
   - dashboard screenshots
   - end-to-end simulator-to-dashboard trace

## Known Risks And Cleanup

1. `.env` is tracked in git. Move secrets to local-only files and commit an `.env.example`.
2. Docker Compose contains development credentials. This is acceptable for local thesis infrastructure, but the thesis should explicitly describe it as local-only.
3. MQTT worker is still a local Node process, not a Docker Compose service. `dev:all` improves development, but full demo reproducibility would be stronger if the worker became a Compose service later.
4. Billing currently accepts both `consumption` and `energy` fields. If both exist for the same device/range, billing semantics must be documented or normalized to one canonical field.
5. Automated tests are still missing.
6. Some older notes/config comments had encoding damage. New documentation should stay UTF-8 clean or ASCII-only.

## Next Actions

1. Run a fresh simulator demo with `docker compose up -d` and `npm run dev:all`.
2. Confirm a new uplink appears in InfluxDB under `meter_reading`.
3. Confirm the dashboard updates through SSE without refresh.
4. Start Phase 7 forecasting implementation.
5. Add tests and thesis evidence after the forecasting module is stable.
