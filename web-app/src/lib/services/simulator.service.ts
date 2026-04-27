import { normalizeDevEui } from "@/lib/validation/device";
import {
  defaultUnitLabelForUtilityType,
  UTILITY_TYPES,
  type UtilityType,
} from "@/lib/utility";

type SimulatorDiscoveredDevice = {
  devEui: string;
  name: string;
  isActive: boolean;
  utilityType: UtilityType;
  unitLabel: string;
  latitude: number | null;
  longitude: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCoordinate(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value < min || value > max) {
    return null;
  }

  return value;
}

function normalizeUtilityType(value: unknown): UtilityType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return (UTILITY_TYPES as readonly string[]).includes(normalized)
    ? (normalized as UtilityType)
    : null;
}

function inferUtilityTypeFromName(name: string): UtilityType {
  const normalized = name.trim().toLowerCase();

  if (normalized.includes("gas")) {
    return "GAS";
  }

  if (normalized.includes("water")) {
    return "WATER";
  }

  if (normalized.includes("heat")) {
    return "HEATING";
  }

  if (normalized.includes("cool")) {
    return "COOLING";
  }

  if (normalized.includes("power") || normalized.includes("electric") || normalized.includes("energy")) {
    return "ELECTRICITY";
  }

  return "ELECTRICITY";
}

function resolveUtilityType(info: Record<string, unknown>, name: string): UtilityType {
  const explicitUtilityType =
    normalizeUtilityType(info.utilityType) ??
    normalizeUtilityType(info.meterType) ??
    normalizeUtilityType(info.type) ??
    normalizeUtilityType(info.profile);

  return explicitUtilityType ?? inferUtilityTypeFromName(name);
}

function resolveUnitLabel(info: Record<string, unknown>, utilityType: UtilityType) {
  const explicitUnitLabel =
    typeof info.unit === "string" && info.unit.trim().length > 0
      ? info.unit.trim()
      : typeof info.unitLabel === "string" && info.unitLabel.trim().length > 0
        ? info.unitLabel.trim()
        : null;

  return explicitUnitLabel ?? defaultUnitLabelForUtilityType(utilityType);
}

function getSimulatorBaseUrl() {
  const configured =
    process.env.SIMULATOR_API_URL ??
    process.env.SIMULATOR_URL ??
    "http://localhost:8000";

  return configured.replace(/\/+$/, "");
}

function getSimulatorTimeoutMs() {
  const configured = Number(process.env.SIMULATOR_API_TIMEOUT_MS ?? "3000");

  if (!Number.isFinite(configured) || configured <= 0) {
    return 3000;
  }

  return configured;
}

function mapSimulatorDevice(rawDevice: unknown): SimulatorDiscoveredDevice | null {
  if (!isRecord(rawDevice)) {
    return null;
  }

  const info = isRecord(rawDevice.info) ? rawDevice.info : null;
  if (!info) {
    return null;
  }

  const rawDevEui = typeof info.devEUI === "string" ? info.devEUI : typeof info.devEui === "string" ? info.devEui : null;
  if (!rawDevEui) {
    return null;
  }

  const devEui = normalizeDevEui(rawDevEui);
  if (devEui.length !== 16) {
    return null;
  }

  const name = typeof info.name === "string" && info.name.trim().length > 0 ? info.name.trim() : `Device ${devEui.slice(-6)}`;
  const status = isRecord(info.status) ? info.status : null;
  const isActive = typeof status?.active === "boolean" ? status.active : true;
  const utilityType = resolveUtilityType(info, name);
  const unitLabel = resolveUnitLabel(info, utilityType);

  const location = isRecord(info.location) ? info.location : null;
  const latitude = normalizeCoordinate(location?.latitude, -90, 90);
  const longitude = normalizeCoordinate(location?.longitude, -180, 180);

  return {
    devEui,
    name,
    isActive,
    utilityType,
    unitLabel,
    latitude,
    longitude,
  };
}

export async function listSimulatorDevices(): Promise<SimulatorDiscoveredDevice[]> {
  if (process.env.SIMULATOR_DEVICE_DISCOVERY_ENABLED === "false") {
    return [];
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, getSimulatorTimeoutMs());

  try {
    const response = await fetch(`${getSimulatorBaseUrl()}/api/devices`, {
      cache: "no-store",
      signal: abortController.signal,
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return [];
    }

    const discovered = payload
      .map(mapSimulatorDevice)
      .filter((device): device is SimulatorDiscoveredDevice => device !== null);

    const byDevEui = new Map<string, SimulatorDiscoveredDevice>();
    for (const device of discovered) {
      byDevEui.set(device.devEui, device);
    }

    return [...byDevEui.values()];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export type { SimulatorDiscoveredDevice };
