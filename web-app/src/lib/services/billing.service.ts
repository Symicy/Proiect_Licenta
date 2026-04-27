import {
  getConsumptionDeltaByDevEui,
  getConsumptionSumByDevEui,
} from "@/lib/services/influx.service";

export type CostCalculationMode = "delta" | "sum";

export type DeviceCostResult = {
  calculationMode: CostCalculationMode;
  consumedUnits: number;
  tariffPerUnit: number;
  unitLabel: string;
  estimatedCost: number;
  period: {
    start: string;
    stop: string;
  };
  details: {
    sumUnits: number;
    firstValueUnits: number;
    lastValueUnits: number;
    deltaUnits: number;
  };
};

export async function calculateDeviceCost(params: {
  devEui: string;
  tariffPerUnit: number;
  unitLabel: string;
  start: Date;
  stop: Date;
  calculationMode: CostCalculationMode;
}): Promise<DeviceCostResult> {
  const [sumUnits, deltaResult] = await Promise.all([
    getConsumptionSumByDevEui({
      devEui: params.devEui,
      start: params.start,
      stop: params.stop,
    }),
    getConsumptionDeltaByDevEui({
      devEui: params.devEui,
      start: params.start,
      stop: params.stop,
    }),
  ]);

  const consumedUnits = params.calculationMode === "sum" ? sumUnits : deltaResult.delta;

  return {
    calculationMode: params.calculationMode,
    consumedUnits,
    tariffPerUnit: params.tariffPerUnit,
    unitLabel: params.unitLabel,
    estimatedCost: consumedUnits * params.tariffPerUnit,
    period: {
      start: params.start.toISOString(),
      stop: params.stop.toISOString(),
    },
    details: {
      sumUnits,
      firstValueUnits: deltaResult.firstValue,
      lastValueUnits: deltaResult.lastValue,
      deltaUnits: deltaResult.delta,
    },
  };
}
