import { createRequire } from "module";
import { config as loadEnv } from "dotenv";
import { InfluxDB } from "@influxdata/influxdb-client";
import pg from "pg";
import {
  consumptionIncrement,
  encodeUtilityPayloadFromReading,
  estimateCumulativeConsumption,
  readingCurrent,
  readingRate,
  readingVoltage,
} from "./demo-telemetry-profile.mjs";

loadEnv({ path: new URL("../.env", import.meta.url) });

const require = createRequire(import.meta.url);
const io = require("socket.io-client");
const { Pool } = pg;

const SIMULATOR_API_URL = (process.env.SIMULATOR_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const APP_DATABASE_URL = process.env.DATABASE_URL;
const INFLUX_URL = process.env.INFLUX_URL;
const INFLUX_TOKEN = process.env.INFLUX_TOKEN;
const INFLUX_ORG = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;
const LIVE_INTERVAL_MS = readPositiveNumber("SIMULATOR_LIVE_INTERVAL_MS", 10000);
const HOUR_MS = 60 * 60 * 1000;

function required(value, label) {
  if (!value) {
    throw new Error(`${label} is not configured.`);
  }

  return value;
}

function readPositiveNumber(name, fallback) {
  const parsed = Number(process.env[name] ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined) {
    return fallback;
  }

  return !["0", "false", "no", "off"].includes(rawValue.trim().toLowerCase());
}

function escapeFluxString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function toFiniteNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

async function fetchSimulatorDevices() {
  const response = await fetch(`${SIMULATOR_API_URL}/api/devices`);
  if (!response.ok) {
    throw new Error(`LWN Simulator returned ${response.status} while listing devices.`);
  }

  const devices = await response.json();
  return Array.isArray(devices) ? devices : [];
}

async function fetchSimulatorStatus() {
  const response = await fetch(`${SIMULATOR_API_URL}/api/status`);
  if (!response.ok) {
    throw new Error(`LWN Simulator returned ${response.status} while reading status.`);
  }

  return Boolean(await response.json());
}

async function listApplicationDevices(pool) {
  const result = await pool.query(`
    SELECT "devEui", name, "utilityType", "unitLabel", "isActive"
    FROM "Device"
    WHERE "isActive" = true
    ORDER BY "utilityType", name
  `);

  return result.rows;
}

function buildDeviceIndex(simulatorDevices, applicationDevices) {
  const simulatorByDevEui = new Map(
    simulatorDevices
      .filter((device) => typeof device?.info?.devEUI === "string")
      .map((device) => [device.info.devEUI.toLowerCase(), device]),
  );

  return applicationDevices
    .map((device) => {
      const simulatorDevice = simulatorByDevEui.get(device.devEui.toLowerCase());
      return simulatorDevice ? { applicationDevice: device, simulatorDevice } : null;
    })
    .filter(Boolean);
}

async function readLatestInfluxConsumption(queryApi, bucket, devEui) {
  const flux = `from(bucket: "${escapeFluxString(bucket)}")
  |> range(start: -90d)
  |> filter(fn: (r) => r._measurement == "meter_reading")
  |> filter(fn: (r) => r.devEui == "${escapeFluxString(devEui)}")
  |> filter(fn: (r) => r._field == "consumption" or r._field == "energy")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 1)`;

  const rows = await queryApi.collectRows(flux);
  const row = rows[0];
  const cumulative = toFiniteNumber(row?._value);
  const timestamp = typeof row?._time === "string" ? new Date(row._time) : null;

  if (cumulative === null || !timestamp || Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return { cumulative, timestamp };
}

async function createInitialState(device, timestamp, queryApi, bucket) {
  const latest = await readLatestInfluxConsumption(queryApi, bucket, device.devEui).catch((error) => {
    console.warn(`Could not read latest InfluxDB consumption for ${device.devEui}: ${error.message}`);
    return null;
  });

  if (latest) {
    return {
      cumulative: latest.cumulative,
      lastTimestamp: latest.timestamp,
      source: "influx",
    };
  }

  const estimated = estimateCumulativeConsumption(device, { stop: timestamp });

  return {
    cumulative: estimated.cumulative,
    lastTimestamp: timestamp,
    source: "estimated",
  };
}

function nextReading(device, state, timestamp) {
  const elapsedHours = Math.max((timestamp.getTime() - state.lastTimestamp.getTime()) / HOUR_MS, LIVE_INTERVAL_MS / HOUR_MS);
  const increment = consumptionIncrement(device, timestamp, elapsedHours);
  const cumulative = state.cumulative + increment;
  const voltage = readingVoltage(device, timestamp);
  const current = readingCurrent(device, increment, elapsedHours);
  const fallbackRate = readingRate(device, increment, elapsedHours);
  const rate = device.utilityType === "ELECTRICITY" ? (voltage * current) / 1000 : fallbackRate;

  state.cumulative = cumulative;
  state.lastTimestamp = timestamp;

  return {
    timestamp,
    cumulative,
    lastIncrement: increment,
    stepHours: elapsedHours,
    rate,
    voltage,
    current,
    powerKw: (voltage * current) / 1000,
  };
}

function emitPayload(socket, simulatorDevice, payload) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);
    const message = {
      id: Number(simulatorDevice.id),
      mtype: simulatorDevice.info?.status?.mtype ?? "UnConfirmedDataUp",
      payload,
    };

    socket.emit("change-payload", message, (...args) => {
      clearTimeout(timeout);
      const acknowledged = args.some((value) => value === true);
      resolve(acknowledged);
    });
  });
}

async function main() {
  required(APP_DATABASE_URL, "DATABASE_URL");
  required(INFLUX_URL, "INFLUX_URL");
  required(INFLUX_TOKEN, "INFLUX_TOKEN");
  required(INFLUX_ORG, "INFLUX_ORG");
  required(INFLUX_BUCKET, "INFLUX_BUCKET");

  const pool = new Pool({ connectionString: APP_DATABASE_URL });
  const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
  const queryApi = influx.getQueryApi(INFLUX_ORG);
  const states = new Map();
  let devicePairs = [];
  let simulatorRunning = false;

  const socket = io(SIMULATOR_API_URL, {
    reconnection: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log(`Connected to LWN Simulator Socket.IO at ${SIMULATOR_API_URL}.`);
  });

  socket.on("connect_error", (error) => {
    console.warn(`LWN Simulator Socket.IO connection error: ${error.message}`);
  });

  async function refreshDeviceList() {
    const [simulatorDevices, applicationDevices] = await Promise.all([
      fetchSimulatorDevices(),
      listApplicationDevices(pool),
    ]);

    devicePairs = buildDeviceIndex(simulatorDevices, applicationDevices);
    const now = new Date();
    for (const { applicationDevice } of devicePairs) {
      if (!states.has(applicationDevice.devEui)) {
        const state = await createInitialState(applicationDevice, now, queryApi, INFLUX_BUCKET);
        states.set(applicationDevice.devEui, state);
      }
    }

    console.log(`Tracking ${devicePairs.length} active demo devices for live payload updates.`);
  }

  async function updatePayloads() {
    try {
      simulatorRunning = await fetchSimulatorStatus();
      if (!simulatorRunning) {
        console.warn("LWN Simulator is not running. Start it from the simulator UI to transmit updated payloads.");
        return;
      }

      if (devicePairs.length === 0) {
        await refreshDeviceList();
      }

      const now = new Date();
      let updated = 0;
      for (const { applicationDevice, simulatorDevice } of devicePairs) {
        const state = states.get(applicationDevice.devEui) ?? await createInitialState(applicationDevice, now, queryApi, INFLUX_BUCKET);
        states.set(applicationDevice.devEui, state);

        const reading = nextReading(applicationDevice, state, now);
        const payload = encodeUtilityPayloadFromReading(applicationDevice, reading);
        const acknowledged = await emitPayload(socket, simulatorDevice, payload);
        if (acknowledged) {
          updated += 1;
        }
      }

      console.log(`Updated ${updated}/${devicePairs.length} simulator payloads at ${now.toISOString()}.`);
    } catch (error) {
      console.error("Failed to update simulator payloads:", error);
    }
  }

  await refreshDeviceList();
  await updatePayloads();

  if (readBoolean("SIMULATOR_LIVE_ONCE", false)) {
    socket.close();
    await pool.end();
    return;
  }

  const timer = setInterval(updatePayloads, LIVE_INTERVAL_MS);
  const refreshTimer = setInterval(refreshDeviceList, 5 * 60 * 1000);

  const shutdown = async () => {
    clearInterval(timer);
    clearInterval(refreshTimer);
    socket.close();
    await pool.end();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
