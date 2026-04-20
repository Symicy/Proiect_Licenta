import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { conflict, serverError, validationError } from "@/lib/api-response";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  signAccessToken,
} from "@/lib/security/token";
import { createUser, getUserByEmail, toPublicUser } from "@/lib/services/user.service";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const payload = registerSchema.parse(requestBody);

    const existingUser = await getUserByEmail(payload.email);
    if (existingUser) {
      return conflict("An account with this email already exists.");
    }

    const createdUser = await createUser({
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: "CUSTOMER",
    });

    const accessToken = await signAccessToken({
      userId: createdUser.id,
      role: createdUser.role,
      email: createdUser.email,
    });

    const response = NextResponse.json(
      {
        user: toPublicUser(createdUser),
        accessToken,
      },
      { status: 201 },
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
