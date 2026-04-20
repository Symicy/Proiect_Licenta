import { InfluxDB } from "@influxdata/influxdb-client";

export type MeterReading = {
  timestamp: string;
  energy: number | null;
  voltage: number | null;
  current: number | null;
};

export type AggregationFn = "mean" | "sum" | "min" | "max" | "last";

type MeterReadingRow = {
  _time?: unknown;
  energy?: unknown;
  voltage?: unknown;
  current?: unknown;
};

function getInfluxConfig() {
  const url = process.env.INFLUX_URL;
  const token = process.env.INFLUX_TOKEN;
  const org = process.env.INFLUX_ORG;
  const bucket = process.env.INFLUX_BUCKET;

  if (!url || !token || !org || !bucket) {
    throw new Error("InfluxDB environment variables are not fully configured.");
  }

  return { url, token, org, bucket };
}

function createQueryApi() {
  const config = getInfluxConfig();
  const influxDb = new InfluxDB({ url: config.url, token: config.token });

  return {
    queryApi: influxDb.getQueryApi(config.org),
    bucket: config.bucket,
  };
}

function escapeFluxString(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function normalizeNumber(value: unknown) {
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

function mapReadingRow(row: MeterReadingRow): MeterReading | null {
  const timestamp = typeof row._time === "string" ? row._time : null;
  if (!timestamp) {
    return null;
  }

  return {
    timestamp,
    energy: normalizeNumber(row.energy),
    voltage: normalizeNumber(row.voltage),
    current: normalizeNumber(row.current),
  };
}

function baseReadingFlux(params: {
  bucket: string;
  devEui: string;
  start: Date;
  stop: Date;
}) {
  return `from(bucket: "${escapeFluxString(params.bucket)}")
  |> range(start: time(v: "${params.start.toISOString()}"), stop: time(v: "${params.stop.toISOString()}"))
  |> filter(fn: (r) => r._measurement == "meter_reading")
  |> filter(fn: (r) => r.devEui == "${escapeFluxString(params.devEui)}")
  |> filter(fn: (r) => r._field == "energy" or r._field == "voltage" or r._field == "current")`;
}

function sortedReadings(readings: MeterReading[]) {
  return [...readings].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

export async function getLatestReadingByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
}) {
  const { queryApi, bucket } = createQueryApi();

  const flux = `${baseReadingFlux({
    bucket,
    devEui: params.devEui,
    start: params.start,
    stop: params.stop,
  })}
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 1)`;

  const rows = await queryApi.collectRows<MeterReadingRow>(flux);
  const latest = rows.map(mapReadingRow).find((value): value is MeterReading => value !== null);

  return latest ?? null;
}

export async function getReadingsByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
  limit: number;
}) {
  const { queryApi, bucket } = createQueryApi();

  const flux = `${baseReadingFlux({
    bucket,
    devEui: params.devEui,
    start: params.start,
    stop: params.stop,
  })}
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: ${params.limit})`;

  const rows = await queryApi.collectRows<MeterReadingRow>(flux);
  const readings = rows
    .map(mapReadingRow)
    .filter((value): value is MeterReading => value !== null);

  return sortedReadings(readings);
}

export async function getAggregatedReadingsByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
  limit: number;
  aggregateWindow: string;
  aggregateFn: AggregationFn;
}) {
  const { queryApi, bucket } = createQueryApi();

  const flux = `${baseReadingFlux({
    bucket,
    devEui: params.devEui,
    start: params.start,
    stop: params.stop,
  })}
  |> aggregateWindow(every: ${params.aggregateWindow}, fn: ${params.aggregateFn}, createEmpty: false)
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: ${params.limit})`;

  const rows = await queryApi.collectRows<MeterReadingRow>(flux);
  const readings = rows
    .map(mapReadingRow)
    .filter((value): value is MeterReading => value !== null);

  return sortedReadings(readings);
}

async function readSingleEnergyValue(flux: string) {
  const { queryApi } = createQueryApi();
  const rows = await queryApi.collectRows<{ _value?: unknown }>(flux);

  const value = rows.length > 0 ? normalizeNumber(rows[0]?._value) : null;
  return value ?? 0;
}

export async function getEnergySumKwhByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
}) {
  const { bucket } = createQueryApi();

  const flux = `from(bucket: "${escapeFluxString(bucket)}")
  |> range(start: time(v: "${params.start.toISOString()}"), stop: time(v: "${params.stop.toISOString()}"))
  |> filter(fn: (r) => r._measurement == "meter_reading")
  |> filter(fn: (r) => r.devEui == "${escapeFluxString(params.devEui)}")
  |> filter(fn: (r) => r._field == "energy")
  |> sum()`;

  return readSingleEnergyValue(flux);
}

export async function getEnergyDeltaKwhByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
}) {
  const { bucket } = createQueryApi();

  const firstFlux = `from(bucket: "${escapeFluxString(bucket)}")
  |> range(start: time(v: "${params.start.toISOString()}"), stop: time(v: "${params.stop.toISOString()}"))
  |> filter(fn: (r) => r._measurement == "meter_reading")
  |> filter(fn: (r) => r.devEui == "${escapeFluxString(params.devEui)}")
  |> filter(fn: (r) => r._field == "energy")
  |> first()`;

  const lastFlux = `from(bucket: "${escapeFluxString(bucket)}")
  |> range(start: time(v: "${params.start.toISOString()}"), stop: time(v: "${params.stop.toISOString()}"))
  |> filter(fn: (r) => r._measurement == "meter_reading")
  |> filter(fn: (r) => r.devEui == "${escapeFluxString(params.devEui)}")
  |> filter(fn: (r) => r._field == "energy")
  |> last()`;

  const [firstValue, lastValue] = await Promise.all([
    readSingleEnergyValue(firstFlux),
    readSingleEnergyValue(lastFlux),
  ]);

  return {
    firstValue,
    lastValue,
    delta: Math.max(lastValue - firstValue, 0),
  };
}
