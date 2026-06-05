import { createHash } from "crypto";
import type { CustomerType } from "@prisma/client";

import prisma from "@/lib/prisma";
import { normalizeClaimCode } from "@/lib/validation/claim-code";

export type ClaimDevicesResult =
  | { status: "claimed"; claimedCount: number }
  | { status: "invalid-code" }
  | { status: "customer-type-mismatch"; expectedCustomerType: CustomerType }
  | { status: "already-claimed-by-other" };

export function hashClaimCode(claimCode: string) {
  return createHash("sha256").update(normalizeClaimCode(claimCode)).digest("hex");
}

export async function validateClaimCodeForCustomerType(claimCode: string, customerType: CustomerType) {
  const claimCodeHash = hashClaimCode(claimCode);
  const devices = await prisma.device.findMany({
    where: { claimCodeHash },
    select: {
      claimCodeCustomerType: true,
      claimedAt: true,
      userId: true,
    },
  });

  if (devices.length === 0) {
    return { status: "invalid-code" } as const;
  }

  const expectedCustomerType = devices.find((device) => device.claimCodeCustomerType)?.claimCodeCustomerType ?? null;
  if (expectedCustomerType && expectedCustomerType !== customerType) {
    return { status: "customer-type-mismatch", expectedCustomerType } as const;
  }

  if (devices.every((device) => device.claimedAt && device.userId)) {
    return { status: "already-claimed-by-other" } as const;
  }

  return { status: "valid", deviceCount: devices.length } as const;
}

export async function claimDevicesForUser(params: {
  userId: string;
  customerType: CustomerType;
  claimCode: string;
}): Promise<ClaimDevicesResult> {
  const claimCodeHash = hashClaimCode(params.claimCode);
  const devices = await prisma.device.findMany({
    where: { claimCodeHash },
    select: {
      id: true,
      userId: true,
      claimCodeCustomerType: true,
      claimedAt: true,
    },
  });

  if (devices.length === 0) {
    return { status: "invalid-code" };
  }

  const expectedCustomerType = devices.find((device) => device.claimCodeCustomerType)?.claimCodeCustomerType ?? null;
  if (expectedCustomerType && expectedCustomerType !== params.customerType) {
    return { status: "customer-type-mismatch", expectedCustomerType };
  }

  const claimedByOther = devices.some((device) => device.claimedAt && device.userId !== params.userId);
  if (claimedByOther) {
    return { status: "already-claimed-by-other" };
  }

  const claimResult = await prisma.device.updateMany({
    where: {
      claimCodeHash,
      OR: [
        { claimedAt: null },
        { userId: params.userId },
      ],
    },
    data: {
      userId: params.userId,
      claimedAt: new Date(),
    },
  });

  return {
    status: "claimed",
    claimedCount: claimResult.count,
  };
}
