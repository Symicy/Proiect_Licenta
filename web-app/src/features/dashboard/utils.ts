import type { MeterReading } from "@/lib/services/influx.service";

import type {
  DeviceRuntimeStatus,
  PublicDevice,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unexpected error.";
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (isRecord(payload) && typeof payload.error === "string") {
      throw new Error(payload.error);
    }

    throw new Error(`Request failed (${response.status}).`);
  }

  return payload as T;
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return value.toFixed(2);
}

export const formatKwh = formatQuantity;

export function formatLoadWatts(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatRelativeTime(timestamp: string | null | undefined) {
  if (!timestamp) {
    return "No reading";
  }

  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return "No reading";
  }

  const diffMs = Date.now() - parsed;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function resolveDeviceStatus(
  device: PublicDevice,
  reading: MeterReading | null | undefined,
  streamStatus: string,
): DeviceRuntimeStatus {
  if (!device.isActive) {
    return "inactive";
  }

  if (!reading) {
    return streamStatus === "error" ? "error" : "heartbeat";
  }

  const ageMs = Date.now() - Date.parse(reading.timestamp);
  if (Number.isNaN(ageMs)) {
    return "heartbeat";
  }

  if (ageMs <= 6 * 60 * 1000) {
    return "connected";
  }

  if (ageMs <= 30 * 60 * 1000) {
    return "heartbeat";
  }

  return "error";
}

export function statusClasses(status: DeviceRuntimeStatus) {
  if (status === "connected") {
    return "bg-tertiary/10 text-tertiary";
  }

  if (status === "error") {
    return "bg-error/10 text-error";
  }

  if (status === "inactive") {
    return "bg-surface-container text-on-surface-variant";
  }

  return "bg-surface-container-highest text-on-surface-variant";
}

export function statusLabel(status: DeviceRuntimeStatus) {
  if (status === "connected") {
    return "Connected";
  }

  if (status === "error") {
    return "Error";
  }

  if (status === "inactive") {
    return "Inactive";
  }

  return "Heartbeat";
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function buildChartPaths(series: Array<number | null>) {
  const valid = series.filter((value): value is number => value !== null && Number.isFinite(value));

  if (valid.length < 2) {
    return {
      linePath: "",
      areaPath: "",
      min: 0,
      max: 0,
    };
  }

  const normalized: number[] = [];
  let lastValue = valid[0];

  for (const point of series) {
    if (point !== null && Number.isFinite(point)) {
      lastValue = point;
      normalized.push(point);
    } else {
      normalized.push(lastValue);
    }
  }

  const min = Math.min(...normalized);
  const max = Math.max(...normalized);
  const spread = max - min || 1;

  const points = normalized.map((value, index) => {
    const x = normalized.length === 1 ? 0 : (index / (normalized.length - 1)) * 100;
    const y = 92 - ((value - min) / spread) * 76;
    return `${x.toFixed(2)},${clamp(y, 4, 96).toFixed(2)}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L100,96 L0,96 Z`;

  return { linePath, areaPath, min, max };
}

export function buildTimelineLabels(readings: MeterReading[]) {
  if (readings.length === 0) {
    return ["--:--", "--:--", "--:--", "--:--", "--:--"];
  }

  const indexes = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.floor((readings.length - 1) * ratio),
  );

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return indexes.map((index) => formatter.format(new Date(readings[index]?.timestamp ?? Date.now())));
}

export function rangeStart(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
