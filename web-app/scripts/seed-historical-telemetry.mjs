import { config as loadEnv } from "dotenv";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import pg from "pg";
import {
  DEFAULT_HISTORY_DAYS,
  DEFAULT_STEP_HOURS,
  consumptionIncrement,
  initialCumulativeConsumption,
  readingCurrent,
  readingVoltage,
  roundDownToHour,
} from "./demo-telemetry-profile.mjs";

loadEnv({ path: new URL("../.env", import.meta.url) });

const { Pool } = pg;

const APP_DATABASE_URL = process.env.DATABASE_URL;
const INFLUX_URL = process.env.INFLUX_URL;
const INFLUX_TOKEN = process.env.INFLUX_TOKEN;
const INFLUX_ORG = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;

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

function escapeInfluxPredicateString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

async function listDevices(pool) {
  const result = await pool.query(`
    SELECT "devEui", name, "utilityType", "unitLabel"
    FROM "Device"
    WHERE "userId" IS NOT NULL AND "isActive" = true
    ORDER BY "utilityType", name
  `);

  return result.rows;
}

async function deleteExistingTelemetry(devices) {
  if (!readBoolean("SEED_HISTORY_CLEAN", true)) {
    return 0;
  }

  let deleted = 0;
  for (const device of devices) {
    const response = await fetch(
      `${INFLUX_URL}/api/v2/delete?org=${encodeURIComponent(INFLUX_ORG)}&bucket=${encodeURIComponent(INFLUX_BUCKET)}`,
      {
        method: "POST",
        headers: {
          authorization: `Token ${INFLUX_TOKEN}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          start: "1970-01-01T00:00:00Z",
          stop: "2100-01-01T00:00:00Z",
          predicate: `_measurement="meter_reading" AND devEui="${escapeInfluxPredicateString(device.devEui)}"`,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to delete old telemetry for ${device.devEui}: ${response.status} ${text}`);
    }

    deleted += 1;
  }

  return deleted;
}

async function main() {
  required(APP_DATABASE_URL, "DATABASE_URL");
  required(INFLUX_URL, "INFLUX_URL");
  required(INFLUX_TOKEN, "INFLUX_TOKEN");
  required(INFLUX_ORG, "INFLUX_ORG");
  required(INFLUX_BUCKET, "INFLUX_BUCKET");

  const days = readPositiveNumber("SEED_HISTORY_DAYS", DEFAULT_HISTORY_DAYS);
  const stepHours = readPositiveNumber("SEED_HISTORY_STEP_HOURS", DEFAULT_STEP_HOURS);
  const pointCount = Math.floor((days * 24) / stepHours) + 1;
  const stop = process.env.SEED_HISTORY_STOP
    ? new Date(process.env.SEED_HISTORY_STOP)
    : roundDownToHour(new Date());

  if (Number.isNaN(stop.getTime())) {
    throw new Error("SEED_HISTORY_STOP must be a valid ISO datetime when provided.");
  }

  const start = new Date(stop.getTime() - days * 24 * 60 * 60 * 1000);
  const pool = new Pool({ connectionString: APP_DATABASE_URL });
  const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
  const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, "ms");

  try {
    const devices = await listDevices(pool);
    if (devices.length === 0) {
      console.log("No active claimed devices found. Run npm run provision:demo-devices first.");
      return;
    }

    const cleanedDevices = await deleteExistingTelemetry(devices);
    if (cleanedDevices > 0) {
      console.log(`Deleted previous meter_reading telemetry for ${cleanedDevices} devices.`);
    }

    let written = 0;
    for (const device of devices) {
      let cumulative = initialCumulativeConsumption(device);

      for (let index = 0; index < pointCount; index += 1) {
        const timestamp = new Date(start.getTime() + index * stepHours * 60 * 60 * 1000);
        const increment = consumptionIncrement(device, timestamp, stepHours);
        cumulative += increment;

        const voltage = readingVoltage(device, timestamp);
        const current = readingCurrent(device, increment, stepHours);

        const point = new Point("meter_reading")
          .tag("devEui", device.devEui)
          .tag("utilityType", device.utilityType)
          .floatField("consumption", Number(cumulative.toFixed(4)))
          .floatField("voltage", Number(voltage.toFixed(2)))
          .floatField("current", Number(current.toFixed(3)))
          .timestamp(timestamp);

        writeApi.writePoint(point);
        written += 1;
      }
    }

    await writeApi.flush();
    console.log(`Seeded ${written} historical telemetry points for ${devices.length} devices.`);
    console.log(`Window: ${start.toISOString()} -> ${stop.toISOString()} every ${stepHours}h.`);
  } finally {
    await writeApi.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
