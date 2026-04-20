import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 12;

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
};

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must be defined and contain at least 16 characters.");
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function signAccessToken(input: {
  userId: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ role: input.role, email: input.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(input.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SECONDS)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  if (
    typeof payload.sub !== "string" ||
    (payload.role !== "ADMIN" && payload.role !== "CUSTOMER") ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Token payload is invalid.");
  }

  return payload as AccessTokenPayload;
}

export function getAccessTokenFromRequest(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader?.toLowerCase().startsWith("bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  return request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
}

export function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  };
}
