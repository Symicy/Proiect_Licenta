import type { NextRequest } from "next/server";

export type RequestUserContext = {
  userId: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
};

export function getRequestUserContext(request: NextRequest): RequestUserContext | null {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");
  const email = request.headers.get("x-user-email");

  if (!userId || !email) {
    return null;
  }

  if (role !== "ADMIN" && role !== "CUSTOMER") {
    return null;
  }

  return { userId, role, email };
}
