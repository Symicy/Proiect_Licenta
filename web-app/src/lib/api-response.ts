import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number, details?: unknown) {
  if (details !== undefined) {
    return NextResponse.json({ error: message, details }, { status });
  }

  return NextResponse.json({ error: message }, { status });
}

export function validationError(details?: unknown, message = "Invalid request payload.") {
  return errorResponse(message, 422, details);
}

export function unauthorized(message = "Unauthorized.") {
  return errorResponse(message, 401);
}

export function conflict(message = "Resource already exists.") {
  return errorResponse(message, 409);
}

export function serverError(error: unknown) {
  console.error("Unexpected API error:", error);
  return errorResponse("Internal server error.", 500);
}
