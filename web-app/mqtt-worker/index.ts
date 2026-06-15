import * as mqtt from "mqtt";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import * as dotenv from "dotenv";

dotenv.config();

const INFLUX_URL = process.env.INFLUX_URL ?? "";
const INFLUX_TOKEN = process.env.INFLUX_TOKEN ?? "";
const INFLUX_ORG = process.env.INFLUX_ORG ?? "";
const INFLUX_BUCKET = process.env.INFLUX_BUCKET ?? "";
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL ?? "mqtt://localhost:1883";

type DecodedUplinkObject = {
  consumption?: number | string;
  energy?: number | string;
  usage?: number | string;
  total?: number | string;
  meter_total?: number | string;
  consumption_total?: number | string;
  consum_total_kWh?: number | string;
  energy_kwh?: number | string;
  thermal_energy_kwh?: number | string;
  heat_energy_kwh?: number | string;
  volume_m3?: number | string;
  water_volume_m3?: number | string;
  gas_volume_m3?: number | string;
  voltage?: number | string;
  current?: number | string;
  tensiune_V?: number | string;
  curent_A?: number | string;
  utilityType?: string;
  meterType?: string;
  [key: string]: unknown;
};

type ChirpStackUplinkPayload = {
  deviceInfo?: {
    devEui?: string;
    tags?: Record<string, string>;
  };
  object?: DecodedUplinkObject;
};

function toFiniteNumber(value: unknown): number | null {
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

function firstFiniteNumber(values: unknown[]) {
  for (const value of values) {
    const normalized = toFiniteNumber(value);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
}

function resolveConsumption(decodedData: DecodedUplinkObject) {
  return firstFiniteNumber([
    decodedData.consumption,
    decodedData.energy,
    decodedData.usage,
    decodedData.total,
    decodedData.meter_total,
    decodedData.consumption_total,
    decodedData.consum_total_kWh,
    decodedData.energy_kwh,
    decodedData.thermal_energy_kwh,
    decodedData.heat_energy_kwh,
    decodedData.volume_m3,
    decodedData.water_volume_m3,
    decodedData.gas_volume_m3,
  ]);
}

function resolveUtilityType(decodedData: DecodedUplinkObject, deviceTags?: Record<string, string>) {
  const rawValue =
    typeof decodedData.utilityType === "string"
      ? decodedData.utilityType
      : typeof decodedData.meterType === "string"
        ? decodedData.meterType
        : typeof deviceTags?.utilityType === "string"
          ? deviceTags.utilityType
          : null;

  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.trim().toUpperCase();
  if (normalized.length === 0) {
    return null;
  }

  return normalized;
}

const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, "ns");
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker.");

  const topic = "application/+/device/+/event/up";
  mqttClient.subscribe(topic, (err: Error | null) => {
    if (!err) {
      console.log(`Subscribed to topic: ${topic}`);
      return;
    }

    console.error("MQTT subscribe error:", err);
  });
});

mqttClient.on("message", (_topic: string, message: Buffer) => {
  try {
    const payload = JSON.parse(message.toString()) as ChirpStackUplinkPayload;
    const devEui = payload.deviceInfo?.devEui;
    const decodedData = payload.object;

    if (!devEui || !decodedData) {
      return;
    }

    const consumption = resolveConsumption(decodedData);
    const voltage = firstFiniteNumber([decodedData.voltage, decodedData.tensiune_V]);
    const current = firstFiniteNumber([decodedData.current, decodedData.curent_A]);

    if (consumption === null && voltage === null && current === null) {
      console.warn(`Skipping uplink for ${devEui}: no mapped numeric fields.`);
      return;
    }

    const point = new Point("meter_reading").tag("devEui", devEui);
    const utilityType = resolveUtilityType(decodedData, payload.deviceInfo?.tags);
    if (utilityType) {
      point.tag("utilityType", utilityType);
    }

    if (consumption !== null) {
      point.floatField("consumption", consumption);
    }
    if (voltage !== null) {
      point.floatField("voltage", voltage);
    }
    if (current !== null) {
      point.floatField("current", current);
    }

    writeApi.writePoint(point);
    void writeApi.flush().catch((error: unknown) => {
      console.error("InfluxDB write error:", error);
    });
  } catch (error: unknown) {
    console.error("MQTT payload parse error:", error);
  }
});

process.on("SIGINT", async () => {
  console.log("Stopping MQTT worker...");
  await writeApi.close();
  mqttClient.end();
  process.exit(0);
});
