import {
  getEnergyDeltaKwhByDevEui,
  getEnergySumKwhByDevEui,
} from "@/lib/services/influx.service";

export type CostCalculationMode = "delta" | "sum";

export type DeviceCostResult = {
  calculationMode: CostCalculationMode;
  consumedKwh: number;
  energyTariff: number;
  estimatedCost: number;
  period: {
    start: string;
    stop: string;
  };
  details: {
    sumKwh: number;
    firstValueKwh: number;
    lastValueKwh: number;
    deltaKwh: number;
  };
};

export async function calculateDeviceCost(params: {
  devEui: string;
  energyTariff: number;
  start: Date;
  stop: Date;
  calculationMode: CostCalculationMode;
}): Promise<DeviceCostResult> {
  const [sumKwh, deltaResult] = await Promise.all([
    getEnergySumKwhByDevEui({
      devEui: params.devEui,
      start: params.start,
      stop: params.stop,
    }),
    getEnergyDeltaKwhByDevEui({
      devEui: params.devEui,
      start: params.start,
      stop: params.stop,
    }),
  ]);

  const consumedKwh = params.calculationMode === "sum" ? sumKwh : deltaResult.delta;

  return {
    calculationMode: params.calculationMode,
    consumedKwh,
    energyTariff: params.energyTariff,
    estimatedCost: consumedKwh * params.energyTariff,
    period: {
      start: params.start.toISOString(),
      stop: params.stop.toISOString(),
    },
    details: {
      sumKwh,
      firstValueKwh: deltaResult.firstValue,
      lastValueKwh: deltaResult.lastValue,
      deltaKwh: deltaResult.delta,
    },
  };
}
