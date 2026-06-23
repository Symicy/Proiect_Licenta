import { createHash } from "crypto";

export const DEFAULT_HISTORY_DAYS = 45;
export const DEFAULT_STEP_HOURS = 3;

const HOUR_MS = 60 * 60 * 1000;

const UTILITY_PROFILES = {
  ELECTRICITY: {
    startMin: 900,
    startRange: 520,
    baseRate: 0.36,
    morningPeak: 0.58,
    eveningPeak: 0.92,
    afternoonPeak: 0.18,
    nightRate: 0.52,
    weekendFactor: 0.94,
    seasonalAmplitude: 0.04,
    noise: 0.16,
    eventChance: 0.018,
    eventLift: 0.45,
    maxHourly: 2.4,
    voltage: 230,
    currentFactor: 4.1,
  },
  GAS: {
    startMin: 380,
    startRange: 300,
    baseRate: 0.075,
    morningPeak: 0.18,
    eveningPeak: 0.22,
    afternoonPeak: 0.04,
    nightRate: 0.42,
    weekendFactor: 1.08,
    seasonalAmplitude: 0.18,
    noise: 0.12,
    eventChance: 0.012,
    eventLift: 0.35,
    maxHourly: 0.72,
    voltage: 36,
    currentFactor: 0.12,
  },
  WATER: {
    startMin: 80,
    startRange: 120,
    baseRate: 0.042,
    morningPeak: 0.14,
    eveningPeak: 0.16,
    afternoonPeak: 0.05,
    nightRate: 0.28,
    weekendFactor: 1.12,
    seasonalAmplitude: 0.05,
    noise: 0.14,
    eventChance: 0.02,
    eventLift: 0.55,
    maxHourly: 0.55,
    voltage: 36,
    currentFactor: 0.08,
  },
  HEATING: {
    startMin: 760,
    startRange: 520,
    baseRate: 0.32,
    morningPeak: 0.54,
    eveningPeak: 0.72,
    afternoonPeak: 0.08,
    nightRate: 0.5,
    weekendFactor: 1.05,
    seasonalAmplitude: 0.22,
    noise: 0.12,
    eventChance: 0.01,
    eventLift: 0.25,
    maxHourly: 2.1,
    voltage: 230,
    currentFactor: 3.2,
  },
  COOLING: {
    startMin: 620,
    startRange: 460,
    baseRate: 0.26,
    morningPeak: 0.08,
    eveningPeak: 0.34,
    afternoonPeak: 0.78,
    nightRate: 0.38,
    weekendFactor: 1.06,
    seasonalAmplitude: 0.2,
    noise: 0.13,
    eventChance: 0.014,
    eventLift: 0.35,
    maxHourly: 2.0,
    voltage: 230,
    currentFactor: 2.9,
  },
  OTHER: {
    startMin: 160,
    startRange: 160,
    baseRate: 0.09,
    morningPeak: 0.08,
    eveningPeak: 0.12,
    afternoonPeak: 0.05,
    nightRate: 0.55,
    weekendFactor: 1,
    seasonalAmplitude: 0.03,
    noise: 0.1,
    eventChance: 0.01,
    eventLift: 0.25,
    maxHourly: 0.7,
    voltage: 12,
    currentFactor: 0.4,
  },
};

export function hashUnit(seed) {
  const hash = createHash("sha256").update(seed).digest();
  return hash.readUInt32BE(0) / 0xffffffff;
}

export function roundDownToHour(date) {
  const rounded = new Date(date);
  rounded.setMinutes(0, 0, 0);
  return rounded;
}

export function profileFor(utilityType) {
  return UTILITY_PROFILES[utilityType] ?? UTILITY_PROFILES.OTHER;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function gaussianHour(hour, center, width) {
  const directDistance = Math.abs(hour - center);
  const distance = Math.min(directDistance, 24 - directDistance);
  return Math.exp(-(distance * distance) / (2 * width * width));
}

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / (24 * HOUR_MS));
}

export function initialCumulativeConsumption(device) {
  const profile = profileFor(device.utilityType);
  return profile.startMin + hashUnit(`${device.devEui}:start`) * profile.startRange;
}

export function consumptionIncrement(device, timestamp, stepHours) {
  const profile = profileFor(device.utilityType);
  const hour = timestamp.getUTCHours() + timestamp.getUTCMinutes() / 60;
  const weekday = timestamp.getUTCDay();
  const isWeekend = weekday === 0 || weekday === 6;
  const deviceBias = 0.82 + hashUnit(`${device.devEui}:bias`) * 0.42;

  const morning = gaussianHour(hour, 7.3, 1.9) * profile.morningPeak;
  const afternoon = gaussianHour(hour, 14.8, 2.6) * profile.afternoonPeak;
  const evening = gaussianHour(hour, 19.2, 2.2) * profile.eveningPeak;
  const nightFactor = hour < 5 || hour >= 23 ? profile.nightRate : 1;
  const weekendFactor = isWeekend ? profile.weekendFactor : 1;
  const seasonal =
    1 + profile.seasonalAmplitude * Math.sin(((dayOfYear(timestamp) - 20) / 365) * Math.PI * 2);
  const noise = 1 + (hashUnit(`${device.devEui}:noise:${timestamp.toISOString()}`) - 0.5) * profile.noise;
  const eventRoll = hashUnit(`${device.devEui}:event:${timestamp.toISOString().slice(0, 13)}`);
  const eventMultiplier = eventRoll > 1 - profile.eventChance ? 1 + profile.eventLift * eventRoll : 1;

  const hourlyRate =
    profile.baseRate *
    deviceBias *
    (1 + morning + afternoon + evening) *
    nightFactor *
    weekendFactor *
    seasonal *
    noise *
    eventMultiplier;

  return clamp(hourlyRate * stepHours, 0.005, profile.maxHourly * stepHours);
}

export function readingVoltage(device, timestamp) {
  const profile = profileFor(device.utilityType);
  const wobble = (hashUnit(`${device.devEui}:voltage:${timestamp.toISOString()}`) - 0.5) * 2.2;
  return profile.voltage + wobble;
}

export function readingCurrent(device, increment, stepHours) {
  const profile = profileFor(device.utilityType);
  return Math.max((increment / stepHours) * profile.currentFactor, 0.01);
}

export function readingRate(device, increment, stepHours) {
  if (!Number.isFinite(increment) || !Number.isFinite(stepHours) || stepHours <= 0) {
    return 0;
  }

  return Math.max(increment / stepHours, 0);
}

export function estimateCumulativeConsumption(device, options = {}) {
  const days = options.days ?? DEFAULT_HISTORY_DAYS;
  const stepHours = options.stepHours ?? DEFAULT_STEP_HOURS;
  const stop = options.stop ?? roundDownToHour(new Date());
  const pointCount = Math.floor((days * 24) / stepHours) + 1;
  const start = new Date(stop.getTime() - days * 24 * HOUR_MS);
  let cumulative = initialCumulativeConsumption(device);
  let lastIncrement = 0;

  for (let index = 0; index < pointCount; index += 1) {
    const timestamp = new Date(start.getTime() + index * stepHours * HOUR_MS);
    lastIncrement = consumptionIncrement(device, timestamp, stepHours);
    cumulative += lastIncrement;
  }

  return { cumulative, lastIncrement, stop, stepHours };
}

export function buildTelemetryReading(device, options = {}) {
  const { cumulative, lastIncrement, stepHours, stop } = estimateCumulativeConsumption(device, options);
  const voltage = readingVoltage(device, stop);
  const current = readingCurrent(device, lastIncrement, stepHours);
  const rate = readingRate(device, lastIncrement, stepHours);

  return {
    timestamp: stop,
    cumulative,
    lastIncrement,
    stepHours,
    rate,
    voltage,
    current,
    powerKw: (voltage * current) / 1000,
  };
}

function decimal(value, precision) {
  return Number.isFinite(value) ? Number(value.toFixed(precision)) : 0;
}

export function encodeUtilityPayloadFromReading(device, reading) {
  const utilityType = device.utilityType ?? "OTHER";
  const total = decimal(reading.cumulative, 3);

  switch (utilityType) {
    case "ELECTRICITY":
      return [
        "E",
        decimal(reading.cumulative, 3),
        decimal(reading.voltage, 1),
        decimal(reading.current, 3),
      ].join(",");
    case "GAS":
      return ["G", total, decimal(reading.rate, 4)].join(",");
    case "WATER":
      return ["W", total, decimal(reading.rate, 4)].join(",");
    case "HEATING":
      return ["H", total, decimal(reading.rate, 4)].join(",");
    case "COOLING":
      return ["C", total, decimal(reading.rate, 4)].join(",");
    default:
      return ["O", total, decimal(reading.rate, 4)].join(",");
  }
}

export function encodeUtilityPayload(device, options = {}) {
  return encodeUtilityPayloadFromReading(device, buildTelemetryReading(device, options));
}

// Backward-compatible name used by existing provisioning code.
export const encodeSmartMeterPayload = encodeUtilityPayload;
