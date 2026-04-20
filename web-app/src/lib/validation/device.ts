import { z } from "zod";

const DEV_EUI_HEX_LENGTH = 16;
const DEV_EUI_REGEX = /^[a-f0-9]{16}$/;

export function normalizeDevEui(value: string) {
  return value.trim().toLowerCase().replace(/[^a-f0-9]/g, "");
}

export function isValidDevEui(value: string) {
  return DEV_EUI_REGEX.test(value);
}

function devEuiSchema(contextLabel: string) {
  return z
    .string()
    .trim()
    .min(1, `${contextLabel} is required.`)
    .transform(normalizeDevEui)
    .refine(isValidDevEui, {
      message: `${contextLabel} must be a valid 16-character hexadecimal identifier.`,
    });
}

export const devEuiParamSchema = devEuiSchema("devEui path parameter");

export const createDeviceSchema = z.object({
  devEui: devEuiSchema("devEui"),
  name: z
    .string()
    .trim()
    .min(2, "Device name must contain at least 2 characters.")
    .max(120, "Device name must contain at most 120 characters."),
  energyTariff: z
    .coerce
    .number()
    .finite("Energy tariff must be a valid number.")
    .min(0, "Energy tariff must be zero or a positive value."),
  isActive: z.boolean().optional().default(true),
});

export const updateDeviceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Device name must contain at least 2 characters.")
      .max(120, "Device name must contain at most 120 characters.")
      .optional(),
    energyTariff: z
      .coerce
      .number()
      .finite("Energy tariff must be a valid number.")
      .min(0, "Energy tariff must be zero or a positive value.")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field must be provided for update.",
  });

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;

export { DEV_EUI_HEX_LENGTH };
