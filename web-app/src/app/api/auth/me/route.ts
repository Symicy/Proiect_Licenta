import type { NextRequest } from "next/server";

import { serverError, success, unauthorized } from "@/lib/api-response";
import { getAccessTokenFromRequest, verifyAccessToken } from "@/lib/security/token";
import { getUserById, toPublicUser } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const token = getAccessTokenFromRequest(request);
    if (!token) {
      return unauthorized("Missing access token.");
    }

    const payload = await verifyAccessToken(token);
    const user = await getUserById(payload.sub);

    if (!user) {
      return unauthorized("Session is invalid.");
    }

    return success({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return serverError(error);
    }

    return unauthorized("Token is invalid or expired.");
  }
}
