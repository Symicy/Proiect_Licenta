import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
} from "@/lib/security/token";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
    ...accessTokenCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
