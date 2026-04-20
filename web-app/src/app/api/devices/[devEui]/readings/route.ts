import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, serverError, success, unauthorized, validationError } from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import {
  getAggregatedReadingsByDevEui,
  getLatestReadingByDevEui,
  getReadingsByDevEui,
} from "@/lib/services/influx.service";
import { getDeviceForUserByDevEui } from "@/lib/services/device.service";
import { devEuiParamSchema } from "@/lib/validation/device";
import { readingsQuerySchema, resolveDateRange } from "@/lib/validation/telemetry";

type RouteContext = {
  params: Promise<{
    devEui: string;
  }>;
};

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
    const query = readingsQuerySchema.parse(rawQuery);

    const { start, stop } = resolveDateRange({
      start: query.start,
      stop: query.stop,
      defaultLookbackHours: 24,
    });

    if (query.mode === "latest") {
      const latest = await getLatestReadingByDevEui({
        devEui,
        start,
        stop,
      });

      return success({
        device: ownership.device,
        query: {
          mode: query.mode,
          start: start.toISOString(),
          stop: stop.toISOString(),
        },
        reading: latest,
      });
    }

    const readings = query.aggregateWindow
      ? await getAggregatedReadingsByDevEui({
          devEui,
          start,
          stop,
          limit: query.limit,
          aggregateWindow: query.aggregateWindow,
          aggregateFn: query.aggregateFn,
        })
      : await getReadingsByDevEui({
          devEui,
          start,
          stop,
          limit: query.limit,
        });

    return success({
      device: ownership.device,
      query: {
        mode: query.mode,
        start: start.toISOString(),
        stop: stop.toISOString(),
        limit: query.limit,
        aggregateWindow: query.aggregateWindow ?? null,
        aggregateFn: query.aggregateWindow ? query.aggregateFn : null,
      },
      readings,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    return serverError(error);
  }
}
