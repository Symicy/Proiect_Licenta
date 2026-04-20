# Thesis Execution Plan - LoRaWAN Smart Energy Monitoring

## Current State
- Prisma relational schema is defined in `prisma/schema.prisma`.
- Existing migration history still reflects an older model and must be aligned.
- MQTT ingest worker already writes telemetry to InfluxDB (`mqtt-worker/index.ts`).
- Next.js app layer is mostly scaffold and still needs API/domain implementation.

## Core Invariants (Must Not Break)
- Polyglot persistence is strict:
  - InfluxDB stores telemetry and time-series only.
  - PostgreSQL stores relational metadata only.
- Never store sensor readings in Prisma models.
- `Device.devEui` is the canonical bridge key across ChirpStack, InfluxDB, and frontend mapping.
- Billing logic pattern: `cost = energyTariff (PostgreSQL) * kWh (InfluxDB)`.

## Decisions Locked
- Dev migration strategy: local dev DB reset is acceptable when Prisma prompts.
- Plan scope: full roadmap to MVP + ARIMA forecasting.

## Phased Roadmap

### Phase 1 - Baseline and Migration Alignment (Blocking)
1. Verify local infrastructure health from `../docker-compose.yml`.
2. Validate/format schema in `prisma/schema.prisma`.
3. Create a new migration to reconcile old migration history with the current User/Device schema.
4. Generate Prisma client and verify applied constraints:
   - UUID PKs.
   - `Role` enum values: `ADMIN`, `CUSTOMER`.
   - `Device.devEui` unique.
   - user-device relation with ownership semantics.

### Phase 2 - Backend Foundation
1. Add Prisma singleton and service layer in `src/`.
2. Add auth flows (register/login/me) and auth middleware.
3. Add request validation and shared API error handling.

### Phase 3 - Device Metadata and Ownership APIs
1. Implement authenticated device CRUD under `src/app/api/`.
2. Enforce `devEui` normalization and uniqueness checks.
3. Enforce ownership checks so each user only accesses own devices.

### Phase 4 - Influx Read APIs and Billing
1. Add Influx query service for latest, interval, and aggregated reads by `devEui`.
2. Add telemetry read endpoints (read-only from InfluxDB).
3. Add billing service and cost endpoints using tariff x kWh.

### Phase 5 - Real-Time Updates (SSE)
1. Implement SSE endpoint scoped to authenticated user and owned devices.
2. Add frontend SSE hook and state synchronization for live dashboard updates.

### Phase 6 - Dashboard Delivery
1. Replace placeholder in `src/app/page.tsx` with project entry/navigation.
2. Build dashboard views:
   - device inventory
   - live metrics
   - historical charts
   - billing summaries

### Phase 7 - Predictive Module (ARIMA)
1. Implement forecasting service using historical Influx data.
2. Expose forecast endpoint(s).
3. Add dashboard visualization for predicted vs observed values.

### Phase 8 - Hardening and Thesis Evidence
1. Add end-to-end verification paths from simulator to UI via `devEui` mapping.
2. Add regressions for ownership isolation, billing correctness, and SSE reconnect.
3. Capture reproducible evidence: queries, endpoint checks, screenshots, logs.

## Priority Execution Order
1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
8. Phase 8

## Verification Checklist
1. Infra: all containers healthy and reachable.
2. Prisma: format/validate/migrate success and expected SQL shape.
3. Data model: ownership and uniqueness constraints validated.
4. Polyglot boundary: telemetry absent from PostgreSQL.
5. Billing correctness: API result equals manual tariff x kWh checks.
6. SSE behavior: live updates and reconnect verified.
7. End-to-end: simulator uplink visible in Influx and user dashboard.
8. Forecasting: ARIMA endpoint returns usable predictions and dashboard renders correctly.

## Relevant Files
- `prisma/schema.prisma`
- `prisma/migrations/20260316111822_init/migration.sql`
- `prisma.config.ts`
- `.env`
- `package.json`
- `mqtt-worker/index.ts`
- `src/app/page.tsx`
- `../docker-compose.yml`
- `../config/chirpstack/chirpstack.toml`

## Notes for Execution
- Never run migration in a production-like environment without explicit backup and review.
- For this project stage, migration execution remains approval-gated before running commands.
- Keep implementation incremental and test each phase before moving to the next.

## Execution Updates

### Update 2026-04-20 - Phase 1 Progress

#### Steps Done
1. Verified infrastructure health with docker compose status (PostgreSQL, InfluxDB, ChirpStack, MQTT, Redis, Simulator all running).
2. Ran Prisma schema formatting and validation.
3. Ran Prisma migration workflow:
   - Applied pending migration `20260316111822_init`.
   - Created and applied alignment migration `20260420131850_init_users_devices`.
4. Verified migration status: database schema is up to date.
5. Regenerated Prisma Client successfully.

#### Feedback
- Phase 1 is completed successfully and the database is now aligned with the current `User` and `Device` schema.
- Prisma warned about destructive changes in the alignment migration (enum value removal, dropped columns, primary key change).
- These warnings are acceptable for this stage because this is a development reset-allowed flow, but the same strategy must not be used on production data.
- The alignment migration includes all expected structural changes: `Role` enum now uses `ADMIN` and `CUSTOMER`, `Device` now has UUID `id` primary key with unique `devEui`, and ownership relation is enforced with required `userId` plus cascade delete.

#### Next Step
1. Start Phase 2 (Backend Foundation): add Prisma singleton, authentication endpoints, middleware, and validation utilities.

### Update 2026-04-20 - Phase 2 Progress

#### Steps Done
1. Installed backend foundation dependencies: `bcryptjs`, `jose`, `zod`, and TypeScript type support for bcrypt.
2. Added Prisma singleton utility in `src/lib/prisma.ts` for stable DB client usage.
3. Added shared API response helpers in `src/lib/api-response.ts`.
4. Added auth payload validation schemas in `src/lib/validation/auth.ts`.
5. Added security utilities:
   - password hashing/verification in `src/lib/security/password.ts`
   - JWT signing/verifying and token extraction in `src/lib/security/token.ts`
6. Added user service layer in `src/lib/services/user.service.ts`.
7. Implemented auth API routes:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
8. Implemented request auth middleware in `src/middleware.ts` to protect `/api/auth/me` and `/api/devices` paths.
9. Added `JWT_SECRET` to local `.env` for runtime token signing/verifying.
10. Ran checks:
   - TypeScript compile check passed (`npx tsc --noEmit`).
   - Lint command failed because of pre-existing `no-explicit-any` issues in `mqtt-worker/index.ts`.

#### Feedback
- Phase 2 core foundation is functionally in place and ready for Phase 3 API/domain work.
- Authentication now supports both bearer token and httpOnly cookie flows.
- Middleware path protection is currently scoped to API endpoints that need authentication at this stage.
- No TypeScript compile errors were introduced by Phase 2 changes.
- Existing lint debt in `mqtt-worker/index.ts` remains and should be cleaned in a dedicated pass.

#### Next Step
1. Start Phase 3 (Device Metadata and Ownership APIs): implement authenticated device CRUD, devEui normalization, and ownership enforcement.

### Update 2026-04-20 - Phase 3 Progress

#### Steps Done
1. Added device validation layer in `src/lib/validation/device.ts`:
   - strict `devEui` normalization (`trim + lowercase + non-hex cleanup`)
   - `devEui` format validation (`16-char hex`)
   - create/update payload schemas for device metadata.
2. Added request user context helper in `src/lib/security/request-user.ts` to read identity headers injected by middleware.
3. Added device domain service in `src/lib/services/device.service.ts` with ownership-safe operations:
   - list devices for authenticated user
   - create device with uniqueness checks
   - get/update/delete by `devEui` with ownership enforcement.
4. Implemented authenticated device API routes:
   - `GET /api/devices` (list owned devices)
   - `POST /api/devices` (create device)
   - `GET /api/devices/[devEui]` (fetch single owned device)
   - `PATCH /api/devices/[devEui]` (update owned device)
   - `DELETE /api/devices/[devEui]` (delete owned device)
5. Resolved pre-existing lint blocker in `mqtt-worker/index.ts` by removing explicit `any` usage and adding typed MQTT payload handling.
6. Ran checks:
   - `npm run lint` passed.
   - `npx tsc --noEmit` passed.
7. Fixed Prisma runtime configuration for Next.js API execution:
   - installed `@prisma/adapter-pg` and `pg`
   - updated `src/lib/prisma.ts` to initialize `PrismaClient` with `PrismaPg` adapter + pooled PostgreSQL connection.
8. Performed live API smoke test against running app (`http://localhost:3000`) with temporary user/device:
   - `POST /api/auth/register` succeeded
   - `POST /api/devices` succeeded
   - `GET /api/devices` returned owned device list
   - `GET /api/devices/[devEui]/readings` succeeded
   - `GET /api/devices/[devEui]/cost` succeeded.

#### Feedback
- Phase 3 is completed successfully: device metadata CRUD is now protected by authentication and user ownership boundaries.
- `devEui` is consistently normalized and validated before persistence and route-level access.
- API behavior now clearly separates `not found`, `forbidden`, and `conflict` scenarios.
- Project lint/compile baseline is now clean after the MQTT worker typing fix.

#### Next Step
1. Start Phase 4 (Influx Read APIs and Billing): implement Influx query services and expose telemetry/cost endpoints using `devEui` bridge plus `energyTariff * kWh` logic.

### Update 2026-04-20 - Phase 4 Progress

#### Steps Done
1. Added telemetry query validation in `src/lib/validation/telemetry.ts`:
   - range/latest modes
   - date-range validation (`start < stop`)
   - aggregation window/function validation
   - billing calculation mode validation (`delta` or `sum`).
2. Added Influx read service in `src/lib/services/influx.service.ts` with support for:
   - latest reading by `devEui`
   - range readings by `devEui`
   - aggregated readings by `devEui`
   - `energy` sum and delta helpers for billing.
3. Added billing service in `src/lib/services/billing.service.ts` implementing:
   - `estimatedCost = consumedKwh * energyTariff`
   - both `delta` and `sum` energy modes.
4. Implemented authenticated telemetry endpoint:
   - `GET /api/devices/[devEui]/readings`
   - supports latest/range/aggregated queries with ownership checks.
5. Implemented authenticated billing endpoint:
   - `GET /api/devices/[devEui]/cost`
   - computes cost using PostgreSQL tariff + Influx kWh data.
6. Ran checks:
   - `npm run lint` passed.
   - `npx tsc --noEmit` passed.

#### Feedback
- Phase 4 is completed successfully: read-only telemetry and cost logic are now exposed through protected device-scoped endpoints.
- Polyglot boundary remains intact: telemetry is read from InfluxDB, while tariff metadata is read from PostgreSQL.
- `devEui` remains the single bridge key for Influx queries and ownership mapping.
- Cost endpoint returns calculation details (`sum`, `first`, `last`, `delta`) to make billing assumptions explicit and auditable.
- Runtime issue discovered during testing (Prisma adapter requirement) was resolved and re-validated with successful endpoint smoke tests.
- Additional terminal matrix validation passed expected status behavior:
   - unauthorized list devices -> `401`
   - create/list/get/patch/delete own device -> `200`
   - access another user device -> `403`
   - get deleted device -> `404`
   - readings and cost endpoints -> `200`.

#### Testing Checkpoint
1. You should start the app and test now, not after all remaining phases.
2. This is the best backend checkpoint before SSE/dashboard implementation because auth + device CRUD + telemetry + billing APIs are already available.

#### Next Step
1. Start Phase 5 (Real-Time Updates with SSE): add server push endpoint and client subscription flow.

### Update 2026-04-20 - Phase 5 Progress

#### Steps Done
1. Added SSE query validation in `src/lib/validation/telemetry.ts`:
   - optional `devEui` filter for single-device stream
   - bounded polling interval (`pollMs` between 1000 and 15000 ms).
2. Implemented authenticated SSE endpoint in `src/app/api/devices/stream/route.ts`:
   - sends `connected`, `meter-reading`, `heartbeat`, and `stream-error` events
   - enforces user ownership before streaming filtered `devEui`
   - polls latest readings from InfluxDB and emits only new timestamps per device.
3. Added reusable frontend stream hook in `src/lib/hooks/useDeviceSse.ts`:
   - EventSource setup/cleanup
   - event listeners and latest reading map by `devEui`
   - stream status and error state exposure for upcoming dashboard integration.
4. Ran checks:
   - `npm run lint` passed.
   - `npx tsc --noEmit` passed.
5. Executed live terminal SSE validation:
   - created a test user and owned device
   - injected synthetic reading into InfluxDB
   - opened `/api/devices/stream` with bearer token
   - confirmed receipt of `connected`, `meter-reading`, and `heartbeat` events.

#### Feedback
- Phase 5 is completed successfully and real-time delivery is working through SSE.
- Ownership rules are respected in the stream endpoint, maintaining data isolation per user.
- `devEui` remains the bridge key for stream filtering and event payloads.
- `curl` exit code `28` during stream test is expected because the test intentionally used a max-time timeout to end a long-lived SSE connection.

#### Testing Checkpoint
1. You should test again now (terminal/API), before moving to dashboard UI work.
2. This checkpoint verifies the real-time backend layer before frontend rendering is introduced.

#### Next Step
1. Start Phase 6 (Dashboard and UX Delivery): build the actual interface and consume the SSE stream from the frontend.

### Update 2026-04-20 - Phase 6 Progress

#### Steps Done
1. Replaced placeholder UI in `src/app/page.tsx` with a full Tailwind dashboard flow aligned to the Stitch exports from `google-stich/`.
2. Implemented an auth-first entry flow:
   - login/register screen using `/api/auth/login` and `/api/auth/register`
   - session bootstrap via `/api/auth/me`.
3. Implemented dashboard shell and navigation views:
   - `Overview` (fleet KPIs, trend chart, alerts, top consumers)
   - `Devices` (search/filter table, live status chips, add device form)
   - `Meter` (live readings, stream health, consumption profile, cost cards)
   - `Billing` (period cost summaries and per-device live projection table).
4. Integrated real-time updates from Phase 5 SSE hook (`useDeviceSse`) into device status and live reading display.
5. Wired selected-device telemetry and billing panels to existing APIs:
   - `/api/devices/[devEui]/readings`
   - `/api/devices/[devEui]/cost`.
6. Updated global visual foundation to Stitch style tokens in Tailwind/global CSS:
   - Luminous Ledger color hierarchy
   - Public Sans typography
   - layered surface styling and gradient CTA treatment.
7. Updated application metadata and layout baseline in `src/app/layout.tsx`.
8. Validation executed:
   - `npm run lint` passed
   - `npx tsc --noEmit` passed.

#### Feedback
- Phase 6 core dashboard delivery is now implemented end-to-end in the frontend and connected to the existing backend stack.
- Design language follows the provided Stitch package while preserving thesis constraints (polyglot persistence unchanged; UI consumes API/SSE only).
- The UI is responsive and data-driven, with explicit ownership-safe backend reuse through existing protected endpoints.
- No new backend schema or persistence changes were introduced during this phase.

#### Testing Checkpoint
1. Start app from `web-app` and validate full UI flow manually:
   - authenticate
   - create/select devices
   - verify live status changes as simulator data arrives
   - verify billing cards/table update for selected meter.
2. Confirm SSE behavior in UI:
   - stream badge transitions (`connecting/open/error`)
   - heartbeat timestamp updates
   - selected meter values update without page refresh.

#### Next Step
1. Start Phase 7 (Predictive Module - ARIMA): implement forecasting service endpoints and add predicted vs observed visualization in dashboard views.

### Update 2026-04-20 - Phase 6 UX Patch (Logout)

#### Steps Done
1. Added logout API endpoint in `src/app/api/auth/logout/route.ts`:
   - `POST /api/auth/logout`
   - clears `access_token` cookie with immediate expiration.
2. Added frontend logout flow in `src/app/page.tsx`:
   - introduced `handleLogout()` that calls `/api/auth/logout`
   - resets authenticated UI state to login mode after successful sign-out.
3. Added visible Logout controls in dashboard shell:
   - desktop sidebar user panel
   - top header actions (visible on mobile as well).
4. Added inline logout error feedback in header area when sign-out fails.
5. Validation executed:
   - `npm run lint` passed
   - `npx tsc --noEmit` passed
   - `POST /api/auth/logout` smoke test returned `200`.

#### Feedback
- The missing logout entry point in the interface is resolved.
- Sign-out is now explicit and accessible from both desktop and mobile layouts.
- Session cleanup is server-backed (cookie invalidation), not only client-state reset.

#### Testing Checkpoint
1. Login with any account, then click `Logout` from header and verify the auth screen appears.
2. Refresh browser after logout and confirm session does not auto-restore.

#### Next Step
1. Continue with Phase 7 (Predictive Module - ARIMA).

### Update 2026-04-20 - Phase 6 UX Patch (Stitch Icons)

#### Steps Done
1. Added Material Symbols support across global UI layers:
   - added `.material-symbols-outlined` and `.icon-fill` utility classes in `src/app/globals.css`
   - loaded Google Material Symbols stylesheet in `src/app/layout.tsx` `<head>` for runtime-safe rendering.
2. Added reusable icon helper in `src/app/page.tsx`:
   - `UIIcon` component for centralized symbol rendering.
3. Aligned major UI sections with Stitch icon language in `src/app/page.tsx`:
   - login screen brand + input icons + submit arrow
   - sidebar navigation icons and mobile chip icons
   - dashboard shell controls (stream, refresh, logout, add device)
   - overview KPI cards and alerts
   - devices search/table/detail actions and create-device controls
   - meter stream/cost cards.
4. Runtime stability hotfix:
   - removed invalid CSS-level Google font `@import` (which caused Next.js parsing error because imports must precede generated rules)
   - kept font loading in layout head so icons render without CSS compilation failures.
5. Validation executed:
   - `npm run lint` passed
   - `npx tsc --noEmit` passed.

#### Feedback
- The previously missing iconography is now restored and visually aligned to the Stitch exports.
- Icons are now consistently available across desktop and mobile navigation/control surfaces.

#### Testing Checkpoint
1. Hard refresh the browser and verify symbols render (not fallback text names) in login, nav, and action buttons.
2. Verify icon visibility specifically in:
   - sidebar nav + Add Device
   - header stream/refresh/logout controls
   - login mail/lock fields and submit arrow.

#### Next Step
1. Continue with Phase 7 (Predictive Module - ARIMA).
