import type { NextRequest } from "next/server";

import { serverError, success, unauthorized } from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import { buildFleetSummaryForUser } from "@/lib/services/fleet-summary.service";

export async function GET(request: NextRequest) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const summary = await buildFleetSummaryForUser(userContext.userId);
    return success({ summary });
  } catch (error) {
    return serverError(error);
  }
}
