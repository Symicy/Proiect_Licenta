import { describe, expect, it, vi } from "vitest";

import {
  defaultUnitLabelForUtilityType,
  isUtilityType,
  utilityTypeLabel,
} from "@/lib/utility";
import {
  costQuerySchema,
  forecastQuerySchema,
  readingsQuerySchema,
  resolveDateRange,
  streamQuerySchema,
} from "@/lib/validation/telemetry";
import {
  createDeviceSchema,
  devEuiParamSchema,
  isValidDevEui,
  normalizeDevEui,
  updateDeviceSchema,
} from "@/lib/validation/device";
import {
  claimCodeSchema,
  normalizeClaimCode,
  optionalClaimCodeSchema,
} from "@/lib/validation/claim-code";
import {
  buildChartPaths,
  customerTypeLabel,
  formatCurrency,
  formatQuantity,
  formatRelativeTime,
  resolveDeviceStatus,
} from "@/features/dashboard/utils";
import type { PublicDevice } from "@/features/dashboard/types";

function device(overrides: Partial<PublicDevice> = {}): PublicDevice {
  return {
    id: "device-1",
    devEui: "0011223344556677",
    name: "Electricity Meter 01",
    utilityType: "ELECTRICITY",
    tariffPerUnit: 0.22,
    unitLabel: "kWh",
    isActive: true,
    latitude: 47.65,
    longitude: 23.55,
    userId: "user-1",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("utility metadata", () => {
  it("recognizes known utility types and rejects unsupported values", () => {
    expect(isUtilityType("ELECTRICITY")).toBe(true);
    expect(isUtilityType("OTHER")).toBe(true);
    expect(isUtilityType("STEAM")).toBe(false);
  });

  it("returns expected unit labels and display labels", () => {
    expect(defaultUnitLabelForUtilityType("ELECTRICITY")).toBe("kWh");
    expect(defaultUnitLabelForUtilityType("GAS")).toBe("m3");
    expect(defaultUnitLabelForUtilityType("OTHER")).toBe("unit");
    expect(utilityTypeLabel("COOLING")).toBe("Cooling");
  });
});

describe("claim code validation", () => {
  it("normalizes spacing and letter casing", () => {
    expect(normalizeClaimCode(" company demo 2026 ")).toBe("COMPANY-DEMO-2026");
  });

  it("accepts normalized claim codes and rejects invalid characters", () => {
    expect(claimCodeSchema.parse("user1 demo 2026")).toBe("USER1-DEMO-2026");
    expect(() => claimCodeSchema.parse("bad/code")).toThrow();
  });

  it("treats empty optional claim codes as undefined", () => {
    expect(optionalClaimCodeSchema.parse("   ")).toBeUndefined();
  });
});

describe("device validation", () => {
  it("normalizes DevEUI values to 16 hexadecimal characters", () => {
    expect(normalizeDevEui("00-11-22-33-44-55-66-77")).toBe("0011223344556677");
    expect(isValidDevEui("0011223344556677")).toBe(true);
    expect(devEuiParamSchema.parse("00:11:22:33:44:55:66:77")).toBe("0011223344556677");
  });

  it("rejects invalid DevEUI, tariff, and coordinates", () => {
    expect(() => devEuiParamSchema.parse("1234")).toThrow();
    expect(() =>
      createDeviceSchema.parse({
        devEui: "0011223344556677",
        name: "Gas Meter",
        utilityType: "GAS",
        tariffPerUnit: -1,
        latitude: 120,
      }),
    ).toThrow();
  });

  it("requires at least one field for device updates", () => {
    expect(() => updateDeviceSchema.parse({})).toThrow();
    expect(updateDeviceSchema.parse({ name: "Updated Meter" }).name).toBe("Updated Meter");
  });
});

describe("telemetry query validation", () => {
  it("rejects invalid date ranges and incompatible latest aggregation", () => {
    expect(() =>
      costQuerySchema.parse({
        start: "2026-06-02T00:00:00.000Z",
        stop: "2026-06-01T00:00:00.000Z",
      }),
    ).toThrow();

    expect(() =>
      readingsQuerySchema.parse({
        mode: "latest",
        aggregateWindow: "5m",
      }),
    ).toThrow();
  });

  it("coerces bounded stream and forecast query parameters", () => {
    expect(streamQuerySchema.parse({ pollMs: "5000" }).pollMs).toBe(5000);
    expect(forecastQuerySchema.parse({ horizonHours: "12", stepHours: "3" })).toMatchObject({
      lookbackHours: 720,
      horizonHours: 12,
      stepHours: 3,
    });
  });

  it("resolves default date ranges from a deterministic stop timestamp", () => {
    const range = resolveDateRange({
      stop: "2026-06-10T12:00:00.000Z",
      defaultLookbackHours: 24,
    });

    expect(range.start.toISOString()).toBe("2026-06-09T12:00:00.000Z");
    expect(range.stop.toISOString()).toBe("2026-06-10T12:00:00.000Z");
  });
});

describe("dashboard formatting and runtime status", () => {
  it("formats currency and quantities defensively", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
    expect(formatCurrency(Number.NaN)).toBe("--");
    expect(formatQuantity(1234)).toBe("1.2k");
    expect(formatQuantity(null)).toBe("--");
  });

  it("builds chart paths from sparse series", () => {
    const paths = buildChartPaths([10, null, 20, 30]);
    expect(paths.linePath).toContain("M0.00");
    expect(paths.areaPath).toContain("Z");
    expect(paths.min).toBe(10);
    expect(paths.max).toBe(30);
  });

  it("resolves live device status from activity and reading age", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));

    expect(
      resolveDeviceStatus(
        device(),
        {
          timestamp: "2026-06-10T11:58:00.000Z",
          consumption: 125,
          voltage: 230,
          current: 2.5,
        },
        "open",
      ),
    ).toBe("connected");
    expect(resolveDeviceStatus(device({ isActive: false }), null, "open")).toBe("inactive");
    expect(resolveDeviceStatus(device(), null, "error")).toBe("error");
    expect(formatRelativeTime("2026-06-10T11:30:00.000Z")).toBe("30 min ago");
    expect(customerTypeLabel("COMPANY")).toBe("Company");

    vi.useRealTimers();
  });
});
