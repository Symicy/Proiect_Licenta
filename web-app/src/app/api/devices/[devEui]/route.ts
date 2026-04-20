import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import {
  errorResponse,
  serverError,
  success,
  unauthorized,
  validationError,
} from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import {
  deleteDeviceForUserByDevEui,
  getDeviceForUserByDevEui,
  updateDeviceForUserByDevEui,
} from "@/lib/services/device.service";
import { devEuiParamSchema, updateDeviceSchema } from "@/lib/validation/device";

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

    const result = await getDeviceForUserByDevEui(userContext.userId, devEui);

    if (result.status === "not-found") {
      return errorResponse("Device not found.", 404);
    }

    if (result.status === "forbidden") {
      return errorResponse("You do not have access to this device.", 403);
    }

    return success({ device: result.device });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    return serverError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const { devEui: devEuiParam } = await context.params;
    const devEui = devEuiParamSchema.parse(devEuiParam);
    const requestBody = await request.json();
    const payload = updateDeviceSchema.parse(requestBody);

    const result = await updateDeviceForUserByDevEui(userContext.userId, devEui, payload);

    if (result.status === "not-found") {
      return errorResponse("Device not found.", 404);
    }

    if (result.status === "forbidden") {
      return errorResponse("You do not have access to this device.", 403);
    }

    return success({ device: result.device });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    if (error instanceof SyntaxError) {
      return validationError(undefined, "Request body must be valid JSON.");
    }

    return serverError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const { devEui: devEuiParam } = await context.params;
    const devEui = devEuiParamSchema.parse(devEuiParam);
    const result = await deleteDeviceForUserByDevEui(userContext.userId, devEui);

    if (result.status === "not-found") {
      return errorResponse("Device not found.", 404);
    }

    if (result.status === "forbidden") {
      return errorResponse("You do not have access to this device.", 403);
    }

    return success({ device: result.device });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    return serverError(error);
  }
}
