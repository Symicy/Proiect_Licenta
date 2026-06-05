# Project Memory Notes

Last updated: 2026-06-01

## Short Project Summary

This thesis project is a LoRaWAN smart utility monitoring platform.

It combines:

1. ChirpStack and LWN-Simulator for local LoRaWAN simulation.
2. Mosquitto MQTT for uplink integration.
3. A TypeScript MQTT worker for ingestion.
4. InfluxDB for telemetry and time-series data.
5. PostgreSQL and Prisma for users, device metadata, customer type, ownership, utility type, tariffs, and coordinates.
6. A Next.js dashboard for authenticated monitoring, billing, and live updates.

## Current Status

The project is in MVP state.

Working:

1. Docker infrastructure starts the local stack.
2. MQTT worker subscribes to ChirpStack uplinks and writes to InfluxDB.
3. Prisma schema and migrations include:
   - users
   - roles
   - customer type
   - devices
   - utility type
   - tariffs
   - unit labels
   - coordinates
4. Auth APIs are implemented.
5. Device ownership APIs are implemented.
6. Influx telemetry read APIs are implemented.
7. Billing APIs are implemented.
8. SSE live update endpoint is implemented.
9. Dashboard UI is implemented for overview, devices, meter, and billing.
10. Map mode exists inside the overview page.
11. `npm run dev:all` starts the web app and MQTT worker together.
12. Claim-code device assignment is implemented for company and individual customer accounts.
13. Demo provisioning creates 50 devices: 10 each for electricity, gas, water, heating, and cooling.
14. Demo devices are registered in LWN-Simulator, ChirpStack, and the app database with ChirpStack tags/variables metadata.

Not done:

1. Forecasting / ARIMA.
2. Automated tests.
3. Final thesis evidence package.
4. Dockerized web app and worker services.
5. Secret cleanup.

## How To Run

From the repository root:

```powershell
docker compose up -d
```

From `web-app`:

```powershell
npm run dev:all
```

Open:

```text
http://localhost:3000
```

## Important Commands

```powershell
npm run lint
npx tsc --noEmit
npm run build
npx prisma migrate status
npx prisma migrate deploy
npm run prisma:generate
npm run provision:demo-devices
```

## Demo Accounts And Devices

The local demo fleet is split per utility type:

1. 7 company devices per type.
2. 3 individual devices per type.
3. Total: 35 company devices and 15 individual devices.

Demo credentials:

1. Company: `company.demo@example.com` / `Demo12345!` / claim code `COMPANY-DEMO-2026`
2. User 1: `user1.demo@example.com` / `Demo12345!` / claim code `USER1-DEMO-2026`
3. User 2: `user2.demo@example.com` / `Demo12345!` / claim code `USER2-DEMO-2026`
4. User 3: `user3.demo@example.com` / `Demo12345!` / claim code `USER3-DEMO-2026`

`OTHER` is intentionally not used in the demo fleet. It remains only as a defensive legacy enum fallback; the visible app options now focus on real meter categories.

## Latest Development Fix

After pulling commit `4849a891171eae42a27a2067042b2e93c120e5e4`, `package.json` had unresolved conflict markers.

The correct script state is:

```json
{
  "dev": "node scripts/dev-with-prisma.mjs",
  "dev:web": "node scripts/dev-with-prisma.mjs",
  "dev:next": "next dev",
  "worker": "ts-node mqtt-worker/index.ts",
  "dev:all": "concurrently --kill-others-on-fail -n web,worker -c cyan,green \"npm run dev:web\" \"npm run worker\"",
  "prisma:generate": "prisma generate"
}
```

Fixes applied:

1. Removed conflict markers from `web-app/package.json`.
2. Preserved the Prisma-aware dev wrapper from `scripts/dev-with-prisma.mjs`.
3. Preserved the MQTT worker and combined `dev:all` scripts.
4. Regenerated Prisma Client.
5. Applied migration `20260510120000_add_customer_type`.
6. Removed stale `.next` generated types for the old `/map` route.

Verified after the fix:

1. `npm run lint` passed.
2. `npx tsc --noEmit` passed.
3. `npx prisma migrate status` reported the local DB is up to date.
4. `npm run dev:all` launched.
5. `http://localhost:3000` returned `200`.
6. `/api/auth/me` returned `401` without a session, which is expected.

## Architecture Boundaries

PostgreSQL:

1. User identity.
2. Customer type.
3. Device ownership.
4. Device metadata.
5. Tariffs and unit labels.
6. Coordinates.

InfluxDB:

1. Meter readings.
2. Consumption or energy fields.
3. Voltage and current fields.
4. Time-series queries and aggregations.

Never store sensor readings in PostgreSQL.

## Current Runtime Flow

1. LWN-Simulator sends simulated LoRaWAN traffic.
2. ChirpStack Gateway Bridge receives UDP packets.
3. ChirpStack processes uplinks.
4. ChirpStack stores device identity and demo metadata in `device.tags` and `device.variables`.
5. Mosquitto exposes MQTT integration events.
6. MQTT worker consumes `application/+/device/+/event/up`.
7. Worker maps decoded payload fields to InfluxDB `meter_reading`.
8. Next.js imports ChirpStack inventory metadata, but keeps business ownership in the app database.
9. Next.js APIs enforce user ownership.
10. Dashboard reads metadata from PostgreSQL and telemetry from InfluxDB.
11. SSE updates the UI with latest readings.

## Next Work

Priority 1:

1. Run a fresh end-to-end simulator demo.
2. Confirm new MQTT uplinks are written to InfluxDB.
3. Confirm dashboard updates live through SSE.

Priority 2:

1. Implement Phase 7 forecasting.
2. Add forecast endpoint.
3. Add predicted-vs-observed chart.

Priority 3:

1. Add tests.
2. Build thesis evidence package.
3. Clean secrets.
4. Consider Dockerizing the worker and web app.

## Known Risks

1. `.env` is tracked and should be replaced with `.env.example` plus local-only secrets.
2. Docker Compose uses development credentials.
3. `consumption` and `energy` fields can overlap in InfluxDB; billing should use one documented canonical field.
4. No automated tests yet.
5. ARIMA must be implemented carefully or isolated into a forecasting service/package.
