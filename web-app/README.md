# WattWise Web App

Next.js dashboard for the LoRaWAN smart utility monitoring thesis project.

## Current State

The web app is a working MVP connected to the local LoRaWAN stack.

Implemented:

- authentication with register, login, session check, and logout
- customer type support for `INDIVIDUAL` and `COMPANY` customers
- claim-code assignment for company and individual device bundles
- authenticated device inventory and metadata editing
- utility-aware device model with tariffs, unit labels, and optional coordinates
- ChirpStack inventory metadata import from `device.tags` and `device.variables`
- InfluxDB telemetry reads by `devEui`
- billing estimates from telemetry consumption and PostgreSQL tariffs
- SSE stream for live meter updates
- dashboard pages for overview, devices, meter details, and billing
- map mode inside the overview page
- MQTT worker for ChirpStack uplink ingestion into InfluxDB

Still pending:

- forecasting / ARIMA module
- automated regression tests
- reproducible thesis evidence package

## Local Development

Start the Docker infrastructure from the repository root:

```powershell
docker compose up -d
```

Then start the web app and MQTT worker together from this directory:

```powershell
cd web-app
npm run dev:all
```

This runs both long-lived processes:

- `npm run dev:web`
  - runs `node scripts/dev-with-prisma.mjs`
  - generates Prisma Client before starting Next.js
  - restarts Next.js when Prisma schema or migrations change
- `npm run worker`
  - runs `ts-node mqtt-worker/index.ts`
  - subscribes to ChirpStack MQTT uplinks
  - writes `meter_reading` points to InfluxDB

Open:

```text
http://localhost:3000
```

## Separate Commands

Use these when debugging one side at a time:

```powershell
npm run dev:web
npm run worker
```

Run the Next.js dev server without the Prisma wrapper:

```powershell
npm run dev:next
```

Generate Prisma Client manually:

```powershell
npm run prisma:generate
```

Provision the local demo fleet:

```powershell
npm run provision:demo-devices
```

The provisioning script creates or refreshes 50 generated devices in LWN-Simulator, ChirpStack, and the app DB. It is idempotent, so rerunning it updates existing generated devices instead of adding duplicates.

## Database Migrations

After pulling commits that include new Prisma migrations, apply them locally:

```powershell
npx prisma migrate deploy
npm run prisma:generate
```

Current latest migration:

```text
20260601143000_add_device_claim_metadata
```

This migration makes app devices claimable before ownership assignment and adds claim-code metadata fields.

## Demo Accounts

All demo accounts use password `Demo12345!`.

- `company.demo@example.com` owns 35 devices and uses claim code `COMPANY-DEMO-2026`
- `user1.demo@example.com` owns 5 devices and uses claim code `USER1-DEMO-2026`
- `user2.demo@example.com` owns 5 devices and uses claim code `USER2-DEMO-2026`
- `user3.demo@example.com` owns 5 devices and uses claim code `USER3-DEMO-2026`

The demo fleet uses five concrete utility types: `ELECTRICITY`, `GAS`, `WATER`, `HEATING`, and `COOLING`. `OTHER` is not shown as a normal app option because it is only a fallback category, not a useful thesis demo meter type.

## Checks

```powershell
npm run lint
npx tsc --noEmit
npm run build
npx prisma migrate status
```

Verified on 2026-06-01:

- `npm run lint` passed
- `npx tsc --noEmit` passed
- `npx prisma migrate status` reported the local database is up to date
- `npm run dev:all` launched the web app and MQTT worker
- `http://localhost:3000` returned `200`

## Important Routes

UI:

- `/home`
- `/devices`
- `/meter`
- `/billing`

API:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/devices`
- `POST /api/devices`
- `POST /api/devices/claim`
- `GET /api/devices/[devEui]`
- `PATCH /api/devices/[devEui]`
- `DELETE /api/devices/[devEui]`
- `GET /api/devices/[devEui]/readings`
- `GET /api/devices/[devEui]/cost`
- `GET /api/devices/summary`
- `GET /api/devices/stream`

## Architecture Notes

- PostgreSQL stores relational metadata only.
- InfluxDB stores telemetry and time-series only.
- `Device.devEui` is the bridge key between ChirpStack, MQTT, InfluxDB, and the dashboard.
- ChirpStack stores LoRaWAN identity plus import metadata in tags/variables; the app stores final business ownership.
- Claim codes are stored as hashes in the app and mirrored as hashes in ChirpStack variables.
- Billing is computed as `consumedUnits * tariffPerUnit`.
- The standalone `/map` route was removed; map functionality is now part of the overview page.

## Known Cleanup

- Move tracked secrets out of `.env` and commit an `.env.example`.
- Add automated tests for ownership, billing, telemetry, and SSE behavior.
- Consider moving the MQTT worker into Docker Compose for full demo reproducibility.
- Normalize or document the difference between Influx `consumption` and `energy` fields before final thesis evidence.
