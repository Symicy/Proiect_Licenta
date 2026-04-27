import { getConsumptionDeltaByDevEui } from "@/lib/services/influx.service";

import { listDevicesForUser } from "./device.service";

export type UtilityCategoryAggregate = {
  utilityType: string;
  unitLabel: string;
  deviceCount: number;
  activeDeviceCount: number;
  today: {
    consumedUnits: number;
    estimatedCost: number;
  };
  week: {
    consumedUnits: number;
    estimatedCost: number;
  };
  month: {
    consumedUnits: number;
    estimatedCost: number;
  };
};

export type FleetSummary = {
  period: {
    todayStart: string;
    weekStart: string;
    monthStart: string;
    stop: string;
  };
  totals: {
    deviceCount: number;
    activeDeviceCount: number;
    utilityCategoryCount: number;
    todayEstimatedCost: number;
    weekEstimatedCost: number;
    monthEstimatedCost: number;
  };
  categories: UtilityCategoryAggregate[];
};

function categoryKey(utilityType: string, unitLabel: string) {
  return `${utilityType}::${unitLabel}`;
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export async function buildFleetSummaryForUser(userId: string): Promise<FleetSummary> {
  const devices = await listDevicesForUser(userId);

  const stop = new Date();
  const todayStart = new Date(stop.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(stop.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(stop.getTime() - 30 * 24 * 60 * 60 * 1000);

  const categoriesMap = new Map<string, UtilityCategoryAggregate>();

  for (const device of devices) {
    const key = categoryKey(device.utilityType, device.unitLabel);
    const existing = categoriesMap.get(key);

    if (existing) {
      existing.deviceCount += 1;
      if (device.isActive) {
        existing.activeDeviceCount += 1;
      }
      continue;
    }

    categoriesMap.set(key, {
      utilityType: device.utilityType,
      unitLabel: device.unitLabel,
      deviceCount: 1,
      activeDeviceCount: device.isActive ? 1 : 0,
      today: { consumedUnits: 0, estimatedCost: 0 },
      week: { consumedUnits: 0, estimatedCost: 0 },
      month: { consumedUnits: 0, estimatedCost: 0 },
    });
  }

  await Promise.all(
    devices.map(async (device) => {
      const [todayDelta, weekDelta, monthDelta] = await Promise.all([
        getConsumptionDeltaByDevEui({
          devEui: device.devEui,
          start: todayStart,
          stop,
        }),
        getConsumptionDeltaByDevEui({
          devEui: device.devEui,
          start: weekStart,
          stop,
        }),
        getConsumptionDeltaByDevEui({
          devEui: device.devEui,
          start: monthStart,
          stop,
        }),
      ]);

      const key = categoryKey(device.utilityType, device.unitLabel);
      const category = categoriesMap.get(key);
      if (!category) {
        return;
      }

      const todayConsumed = safeNumber(todayDelta.delta);
      const weekConsumed = safeNumber(weekDelta.delta);
      const monthConsumed = safeNumber(monthDelta.delta);
      const tariff = safeNumber(device.tariffPerUnit);

      category.today.consumedUnits += todayConsumed;
      category.today.estimatedCost += todayConsumed * tariff;
      category.week.consumedUnits += weekConsumed;
      category.week.estimatedCost += weekConsumed * tariff;
      category.month.consumedUnits += monthConsumed;
      category.month.estimatedCost += monthConsumed * tariff;
    }),
  );

  const categories = [...categoriesMap.values()].sort(
    (first, second) => second.month.estimatedCost - first.month.estimatedCost,
  );

  return {
    period: {
      todayStart: todayStart.toISOString(),
      weekStart: weekStart.toISOString(),
      monthStart: monthStart.toISOString(),
      stop: stop.toISOString(),
    },
    totals: {
      deviceCount: devices.length,
      activeDeviceCount: devices.filter((device) => device.isActive).length,
      utilityCategoryCount: categories.length,
      todayEstimatedCost: categories.reduce((sum, category) => sum + category.today.estimatedCost, 0),
      weekEstimatedCost: categories.reduce((sum, category) => sum + category.week.estimatedCost, 0),
      monthEstimatedCost: categories.reduce((sum, category) => sum + category.month.estimatedCost, 0),
    },
    categories,
  };
}
