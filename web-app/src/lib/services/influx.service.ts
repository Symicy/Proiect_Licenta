import { InfluxDB } from "@influxdata/influxdb-client";

export type MeterReading = {
  timestamp: string;
  consumption: number | null;
  voltage: number | null;
  current: number | null;
  rate: number | null;
};

export type AggregationFn = "mean" | "sum" | "min" | "max" | "last";

type MeterReadingRow = {
  _time?: unknown;
  consumption?: unknown;
  energy?: unknown;
  voltage?: unknown;
  current?: unknown;
  rate?: unknown;
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
    consumption: normalizeNumber(row.consumption ?? row.energy),
    voltage: normalizeNumber(row.voltage),
    current: normalizeNumber(row.current),
    rate: normalizeNumber(row.rate),
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
  |> filter(fn: (r) => r._field == "consumption" or r._field == "energy" or r._field == "voltage" or r._field == "current" or r._field == "rate")`;
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

export async function getForecastTrainingReadingsByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
  stepHours: number;
}) {
  const limit = Math.ceil(
    (params.stop.getTime() - params.start.getTime()) / (params.stepHours * 60 * 60 * 1000),
  ) + 5;

  return getAggregatedReadingsByDevEui({
    devEui: params.devEui,
    start: params.start,
    stop: params.stop,
    limit,
    aggregateWindow: `${params.stepHours}h`,
    aggregateFn: "last",
  });
}

async function readSingleNumberValue(flux: string) {
  const { queryApi } = createQueryApi();
  const rows = await queryApi.collectRows<{ _value?: unknown }>(flux);

  const value = rows.length > 0 ? normalizeNumber(rows[0]?._value) : null;
  return value;
}

async function readFieldAggregateValue(params: {
  devEui: string;
  start: Date;
  stop: Date;
  field: "consumption" | "energy";
  aggregate: "sum" | "first" | "last";
}) {
  const { bucket } = createQueryApi();

  const flux = `from(bucket: "${escapeFluxString(bucket)}")
  |> range(start: time(v: "${params.start.toISOString()}"), stop: time(v: "${params.stop.toISOString()}"))
  |> filter(fn: (r) => r._measurement == "meter_reading")
  |> filter(fn: (r) => r.devEui == "${escapeFluxString(params.devEui)}")
  |> filter(fn: (r) => r._field == "${params.field}")
  |> group()
  |> ${params.aggregate}()`;

  return readSingleNumberValue(flux);
}

async function readConsumptionFieldAggregateValue(params: {
  devEui: string;
  start: Date;
  stop: Date;
  aggregate: "sum" | "first" | "last";
}) {
  const consumptionValue = await readFieldAggregateValue({
    ...params,
    field: "consumption",
  });

  if (consumptionValue !== null) {
    return consumptionValue;
  }

  return (
    (await readFieldAggregateValue({
      ...params,
      field: "energy",
    })) ?? 0
  );
}

export async function getConsumptionSumByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
}) {
  return readConsumptionFieldAggregateValue({
    ...params,
    aggregate: "sum",
  });
}

export async function getConsumptionDeltaByDevEui(params: {
  devEui: string;
  start: Date;
  stop: Date;
}) {
  const [firstValue, lastValue] = await Promise.all([
    readConsumptionFieldAggregateValue({
      ...params,
      aggregate: "first",
    }),
    readConsumptionFieldAggregateValue({
      ...params,
      aggregate: "last",
    }),
  ]);

  return {
    firstValue,
    lastValue,
    delta: Math.max(lastValue - firstValue, 0),
  };
}

// Backward-compatible aliases used by older callers.
export const getEnergySumKwhByDevEui = getConsumptionSumByDevEui;
export const getEnergyDeltaKwhByDevEui = getConsumptionDeltaByDevEui;
