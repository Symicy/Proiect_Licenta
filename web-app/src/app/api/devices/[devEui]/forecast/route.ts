import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, serverError, success, unauthorized, validationError } from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import { getDeviceForUserByDevEui } from "@/lib/services/device.service";
import { runArimaForecast } from "@/lib/services/forecast.service";
import { getForecastTrainingReadingsByDevEui } from "@/lib/services/influx.service";
import { devEuiParamSchema } from "@/lib/validation/device";
import { forecastQuerySchema } from "@/lib/validation/telemetry";

type RouteContext = {
  params: Promise<{
    devEui: string;
  }>;
};

function forecastDelta(params: { observedLast: number | null; forecastLast: number | null }) {
  if (params.observedLast === null || params.forecastLast === null) {
    return 0;
  }

  return Math.max(params.forecastLast - params.observedLast, 0);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const { devEui: devEuiParam } = await context.params;
    const devEui = devEuiParamSchema.parse(devEuiParam);

    const ownership = await getDeviceForUserByDevEui(userContext.userId, devEui);
    if (ownership.status === "not-found") {
      return errorResponse("Device not found.", 404);
    }

    if (ownership.status === "forbidden") {
      return errorResponse("You do not have access to this device.", 403);
    }

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = forecastQuerySchema.parse(rawQuery);
    const stop = new Date();
    const start = new Date(stop.getTime() - query.lookbackHours * 60 * 60 * 1000);

    const observed = await getForecastTrainingReadingsByDevEui({
      devEui,
      start,
      stop,
      stepHours: query.stepHours,
    });

    const model = await runArimaForecast({
      readings: observed,
      horizonHours: query.horizonHours,
      stepHours: query.stepHours,
    });

    const observedValues = observed
      .map((reading) => reading.consumption)
      .filter((value): value is number => value !== null && Number.isFinite(value));
    const observedLast = observedValues.at(-1) ?? null;
    const forecastLast = model.forecast.at(-1)?.value ?? null;
    const deltaUnits = forecastDelta({ observedLast, forecastLast });

    return success({
      device: ownership.device,
      query: {
        start: start.toISOString(),
        stop: stop.toISOString(),
        lookbackHours: query.lookbackHours,
        horizonHours: query.horizonHours,
        stepHours: query.stepHours,
      },
      observed,
      forecast: model.forecast,
      model: {
        status: model.status,
        order: model.order,
        metadata: model.metadata,
      },
      estimate: {
        forecastedDeltaUnits: deltaUnits,
        tariffPerUnit: ownership.device.tariffPerUnit,
        unitLabel: ownership.device.unitLabel,
        estimatedCost: deltaUnits * ownership.device.tariffPerUnit,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    return serverError(error);
  }
}
