import type { MeterReading } from "@/lib/services/influx.service";

export type ForecastServiceStatus = "ok" | "insufficient_data" | "model_error" | "service_unavailable";

export type ForecastPoint = {
  timestamp: string;
  value: number;
  lower: number | null;
  upper: number | null;
};

export type ForecastModelResult = {
  status: ForecastServiceStatus;
  forecast: ForecastPoint[];
  order: [number, number, number] | null;
  metadata: Record<string, number | string | null>;
};

type ForecastServicePayload = {
  status?: unknown;
  forecast?: unknown;
  order?: unknown;
  metadata?: unknown;
};

function getForecastServiceUrl() {
  return (process.env.FORECAST_SERVICE_URL ?? "http://localhost:8001").replace(/\/+$/, "");
}

function getForecastTimeoutMs() {
  const configured = Number(process.env.FORECAST_SERVICE_TIMEOUT_MS ?? "10000");
  return Number.isFinite(configured) && configured > 0 ? configured : 10000;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeOrder(value: unknown): [number, number, number] | null {
  if (!Array.isArray(value) || value.length !== 3) {
    return null;
  }

  const order = value.map(normalizeNumber);
  if (order.some((part) => part === null)) {
    return null;
  }

  return order as [number, number, number];
}

function normalizeForecastPoint(value: unknown): ForecastPoint | null {
  if (!isRecord(value) || typeof value.timestamp !== "string") {
    return null;
  }

  const forecastValue = normalizeNumber(value.value);
  if (forecastValue === null) {
    return null;
  }

  return {
    timestamp: value.timestamp,
    value: forecastValue,
    lower: normalizeNumber(value.lower),
    upper: normalizeNumber(value.upper),
  };
}

function normalizeMetadata(value: unknown): Record<string, number | string | null> {
  if (!isRecord(value)) {
    return {};
  }

  const metadata: Record<string, number | string | null> = {};
  for (const [key, rawValue] of Object.entries(value)) {
    if (typeof rawValue === "string") {
      metadata[key] = rawValue;
      continue;
    }

    metadata[key] = normalizeNumber(rawValue);
  }

  return metadata;
}

function serviceUnavailableResult(message: string): ForecastModelResult {
  return {
    status: "service_unavailable",
    forecast: [],
    order: null,
    metadata: {
      error: message,
    },
  };
}

export async function runArimaForecast(params: {
  readings: MeterReading[];
  horizonHours: number;
  stepHours: number;
}): Promise<ForecastModelResult> {
  const points = params.readings
    .filter((reading) => reading.consumption !== null && Number.isFinite(reading.consumption))
    .map((reading) => ({
      timestamp: reading.timestamp,
      value: reading.consumption as number,
    }));

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), getForecastTimeoutMs());

  try {
    const response = await fetch(`${getForecastServiceUrl()}/forecast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        points,
        horizonHours: params.horizonHours,
        stepHours: params.stepHours,
      }),
      signal: abortController.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return serviceUnavailableResult(`Forecast service returned ${response.status}.`);
    }

    const payload = (await response.json()) as ForecastServicePayload;
    const status =
      payload.status === "ok" || payload.status === "insufficient_data" || payload.status === "model_error"
        ? payload.status
        : "model_error";
    const forecast = Array.isArray(payload.forecast)
      ? payload.forecast
          .map(normalizeForecastPoint)
          .filter((point): point is ForecastPoint => point !== null)
      : [];

    return {
      status,
      forecast,
      order: normalizeOrder(payload.order),
      metadata: normalizeMetadata(payload.metadata),
    };
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Forecast service timed out."
      : error instanceof Error
        ? error.message
        : "Forecast service is unavailable.";

    return serviceUnavailableResult(message);
  } finally {
    clearTimeout(timeout);
  }
}
