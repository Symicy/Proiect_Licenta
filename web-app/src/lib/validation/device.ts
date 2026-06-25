import { z } from "zod";
import { UTILITY_TYPES } from "@/lib/utility";

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

function optionalCoordinateSchema(label: string, min: number, max: number) {
  return z
    .union([
      z
        .coerce
        .number()
        .finite(`${label} must be a valid number.`)
        .min(min, `${label} must be between ${min} and ${max}.`)
        .max(max, `${label} must be between ${min} and ${max}.`),
      z.null(),
    ])
    .optional();
}

const latitudeSchema = optionalCoordinateSchema("Latitude", -90, 90);
const longitudeSchema = optionalCoordinateSchema("Longitude", -180, 180);

export const devEuiParamSchema = devEuiSchema("devEui path parameter");

export const createDeviceSchema = z.object({
  devEui: devEuiSchema("devEui"),
  name: z
    .string()
    .trim()
    .min(2, "Device name must contain at least 2 characters.")
    .max(120, "Device name must contain at most 120 characters."),
  utilityType: z.enum(UTILITY_TYPES).default("ELECTRICITY"),
  tariffPerUnit: z
    .coerce
    .number()
    .finite("Tariff per unit must be a valid number.")
    .min(0, "Tariff per unit must be zero or a positive value."),
  unitLabel: z
    .string()
    .trim()
    .min(1, "Unit label is required.")
    .max(16, "Unit label must contain at most 16 characters.")
    .optional(),
  isActive: z.boolean().optional().default(true),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export const updateDeviceSchema = z
  .object({
    tariffPerUnit: z
      .coerce
      .number()
      .finite("Tariff per unit must be a valid number.")
      .min(0, "Tariff per unit must be zero or a positive value.")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field must be provided for update.",
  });

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;

export { DEV_EUI_HEX_LENGTH };
