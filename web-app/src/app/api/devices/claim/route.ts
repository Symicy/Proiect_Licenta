import { type NextRequest } from "next/server";
import { ZodError } from "zod";

import { conflict, errorResponse, serverError, success, unauthorized, validationError } from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import { syncChirpStackInventory } from "@/lib/services/chirpstack-inventory.service";
import { claimDevicesForUser } from "@/lib/services/claim-code.service";
import { listDevicesForUser } from "@/lib/services/device.service";
import { getUserById } from "@/lib/services/user.service";
import { claimDevicesSchema } from "@/lib/validation/claim-code";

export async function POST(request: NextRequest) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const user = await getUserById(userContext.userId);
    if (!user || user.role !== "CUSTOMER" || !user.customerType) {
      return errorResponse("Only customer accounts can claim devices.", 403);
    }

    const requestBody = await request.json();
    const payload = claimDevicesSchema.parse(requestBody);

    await syncChirpStackInventory();

    const claimResult = await claimDevicesForUser({
      userId: user.id,
      customerType: user.customerType,
      claimCode: payload.claimCode,
    });

    if (claimResult.status === "invalid-code") {
      return validationError(undefined, "Claim code is invalid or no devices are linked to it.");
    }

    if (claimResult.status === "customer-type-mismatch") {
      return validationError(
        undefined,
        `This claim code is reserved for ${claimResult.expectedCustomerType.toLowerCase()} accounts.`,
      );
    }

    if (claimResult.status === "already-claimed-by-other") {
      return conflict("This claim code has already been used by another account.");
    }

    const devices = await listDevicesForUser(user.id);
    return success({
      claimedCount: claimResult.claimedCount,
      devices,
    });
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
