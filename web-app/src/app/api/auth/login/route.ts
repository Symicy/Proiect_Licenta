import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { serverError, unauthorized, validationError } from "@/lib/api-response";
import { verifyPassword } from "@/lib/security/password";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  signAccessToken,
} from "@/lib/security/token";
import { getUserByEmail, toPublicUser } from "@/lib/services/user.service";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const payload = loginSchema.parse(requestBody);

    const existingUser = await getUserByEmail(payload.email);
    if (!existingUser) {
      return unauthorized("Email or password is incorrect.");
    }

    const isPasswordValid = await verifyPassword(payload.password, existingUser.passwordHash);
    if (!isPasswordValid) {
      return unauthorized("Email or password is incorrect.");
    }

    const accessToken = await signAccessToken({
      userId: existingUser.id,
      role: existingUser.role,
      email: existingUser.email,
    });

    const response = NextResponse.json(
      {
        user: toPublicUser(existingUser),
        accessToken,
      },
      { status: 200 },
    );

    response.cookies.set(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      accessTokenCookieOptions(),
    );

    return response;
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
