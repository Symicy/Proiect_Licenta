import { z } from "zod";

const CLAIM_CODE_REGEX = /^[A-Z0-9][A-Z0-9-]{2,62}[A-Z0-9]$/;

export function normalizeClaimCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

export const claimCodeSchema = z
  .string()
  .trim()
  .min(4, "Claim code must contain at least 4 characters.")
  .max(64, "Claim code must contain at most 64 characters.")
  .transform(normalizeClaimCode)
  .refine((value) => CLAIM_CODE_REGEX.test(value), {
    message: "Claim code may contain only letters, numbers, and hyphens.",
  });

export const optionalClaimCodeSchema = z
  .string()
  .optional()
  .transform((value) => {
    const normalized = value ? normalizeClaimCode(value) : "";
    return normalized.length > 0 ? normalized : undefined;
  })
  .pipe(claimCodeSchema.optional());

export const claimDevicesSchema = z.object({
  claimCode: claimCodeSchema,
});
