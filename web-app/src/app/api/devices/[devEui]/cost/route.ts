import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, serverError, success, unauthorized, validationError } from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import { calculateDeviceCost } from "@/lib/services/billing.service";
import { getDeviceForUserByDevEui } from "@/lib/services/device.service";
import { devEuiParamSchema } from "@/lib/validation/device";
import { costQuerySchema, resolveDateRange } from "@/lib/validation/telemetry";

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
    const query = costQuerySchema.parse(rawQuery);

    const { start, stop } = resolveDateRange({
      start: query.start,
      stop: query.stop,
      defaultLookbackHours: 24,
    });

    const cost = await calculateDeviceCost({
      devEui,
      energyTariff: ownership.device.energyTariff,
      start,
      stop,
      calculationMode: query.calculationMode,
    });

    return success({
      device: ownership.device,
      cost,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    return serverError(error);
  }
}
