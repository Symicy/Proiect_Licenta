import { createHash } from "crypto";
import { config as loadEnv } from "dotenv";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import pg from "pg";

loadEnv({ path: new URL("../.env", import.meta.url) });

const { Pool } = pg;

const APP_DATABASE_URL = process.env.DATABASE_URL;
const INFLUX_URL = process.env.INFLUX_URL;
const INFLUX_TOKEN = process.env.INFLUX_TOKEN;
const INFLUX_ORG = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;

const DEFAULT_DAYS = 45;
const DEFAULT_STEP_HOURS = 3;

const UTILITY_PROFILES = {
  ELECTRICITY: {
    base: 1.2,
    dailyAmplitude: 0.45,
    noise: 0.18,
    voltage: 230,
    currentFactor: 4.3,
  },
  GAS: {
    base: 0.55,
    dailyAmplitude: 0.2,
    noise: 0.08,
    voltage: 3.6,
    currentFactor: 0.03,
  },
  WATER: {
    base: 0.32,
    dailyAmplitude: 0.12,
    noise: 0.05,
    voltage: 3.6,
    currentFactor: 0.02,
  },
  HEATING: {
    base: 0.95,
    dailyAmplitude: 0.38,
    noise: 0.14,
    voltage: 230,
    currentFactor: 3.2,
  },
  COOLING: {
    base: 0.8,
    dailyAmplitude: 0.34,
    noise: 0.12,
    voltage: 230,
    currentFactor: 2.9,
  },
  OTHER: {
    base: 0.35,
    dailyAmplitude: 0.12,
    noise: 0.06,
    voltage: 12,
    currentFactor: 0.4,
  },
};

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

function hashUnit(seed) {
  const hash = createHash("sha256").update(seed).digest();
  return hash.readUInt32BE(0) / 0xffffffff;
}

function roundDownToHour(date) {
  const rounded = new Date(date);
  rounded.setMinutes(0, 0, 0);
  return rounded;
}

function profileFor(utilityType) {
  return UTILITY_PROFILES[utilityType] ?? UTILITY_PROFILES.OTHER;
}

function consumptionIncrement(device, stepIndex, stepHours) {
  const profile = profileFor(device.utilityType);
  const hourOfDay = (stepIndex * stepHours) % 24;
  const dayIndex = Math.floor((stepIndex * stepHours) / 24);
  const deviceBias = 0.72 + hashUnit(`${device.devEui}:bias`) * 0.68;
  const dailyWave = Math.sin(((hourOfDay - 7) / 24) * Math.PI * 2);
  const weeklyWave = Math.sin((dayIndex / 7) * Math.PI * 2);
  const deterministicNoise = (hashUnit(`${device.devEui}:${stepIndex}`) - 0.5) * profile.noise;
  const profileMultiplier =
    1 + profile.dailyAmplitude * Math.max(dailyWave, -0.45) + 0.12 * weeklyWave + deterministicNoise;

  return Math.max(profile.base * deviceBias * profileMultiplier * stepHours, 0.01);
}

function readingVoltage(device, stepIndex) {
  const profile = profileFor(device.utilityType);
  const wobble = (hashUnit(`${device.devEui}:voltage:${stepIndex}`) - 0.5) * 2.2;
  return profile.voltage + wobble;
}

function readingCurrent(device, increment, stepHours) {
  const profile = profileFor(device.utilityType);
  return Math.max((increment / stepHours) * profile.currentFactor, 0.01);
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

async function main() {
  required(APP_DATABASE_URL, "DATABASE_URL");
  required(INFLUX_URL, "INFLUX_URL");
  required(INFLUX_TOKEN, "INFLUX_TOKEN");
  required(INFLUX_ORG, "INFLUX_ORG");
  required(INFLUX_BUCKET, "INFLUX_BUCKET");

  const days = readPositiveNumber("SEED_HISTORY_DAYS", DEFAULT_DAYS);
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

    let written = 0;
    for (const device of devices) {
      let cumulative = 80 + hashUnit(`${device.devEui}:start`) * 240;

      for (let index = 0; index < pointCount; index += 1) {
        const timestamp = new Date(start.getTime() + index * stepHours * 60 * 60 * 1000);
        const increment = consumptionIncrement(device, index, stepHours);
        cumulative += increment;

        const voltage = readingVoltage(device, index);
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
