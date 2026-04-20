import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import {
  conflict,
  errorResponse,
  serverError,
  success,
  unauthorized,
  validationError,
} from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import { createDeviceForUser, listDevicesForUser } from "@/lib/services/device.service";
import { createDeviceSchema } from "@/lib/validation/device";

export async function GET(request: NextRequest) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const devices = await listDevicesForUser(userContext.userId);

    return success({ devices });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const requestBody = await request.json();
    const payload = createDeviceSchema.parse(requestBody);

    const result = await createDeviceForUser(userContext.userId, payload);

    if (result.status === "owned-by-other-user") {
      return conflict("This devEui is already linked to another user.");
    }

    if (result.status === "already-owned") {
      return conflict("This device already exists for your account.");
    }

    return success({ device: result.device }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    if (error instanceof SyntaxError) {
      return validationError(undefined, "Request body must be valid JSON.");
    }

    return errorResponse("Failed to create device.", 500);
  }
}
