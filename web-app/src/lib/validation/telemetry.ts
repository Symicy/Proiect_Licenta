import { z } from "zod";

import { isValidDevEui, normalizeDevEui } from "@/lib/validation/device";

const fluxDurationRegex = /^\d+(s|m|h|d|w)$/;
const dateTimeSchema = z.string().datetime({ offset: true });

function validateDateRange(value: { start?: string; stop?: string }, ctx: z.RefinementCtx) {
  if (!value.start || !value.stop) {
    return;
  }

  const startDate = new Date(value.start);
  const stopDate = new Date(value.stop);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(stopDate.getTime())) {
    return;
  }

  if (stopDate <= startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "stop must be greater than start.",
      path: ["stop"],
    });
  }
}

export const readingsQuerySchema = z
  .object({
    mode: z.enum(["range", "latest"]).default("range"),
    start: dateTimeSchema.optional(),
    stop: dateTimeSchema.optional(),
    limit: z.coerce.number().int().min(1).max(5000).default(500),
    aggregateWindow: z
      .string()
      .trim()
      .toLowerCase()
      .regex(fluxDurationRegex, "aggregateWindow must be a valid Flux duration, like 5m or 1h.")
      .optional(),
    aggregateFn: z.enum(["mean", "sum", "min", "max", "last"]).default("mean"),
  })
  .superRefine((value, ctx) => {
    validateDateRange(value, ctx);

    if (value.mode === "latest" && value.aggregateWindow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "aggregateWindow cannot be used when mode=latest.",
        path: ["aggregateWindow"],
      });
    }
  });

export const costQuerySchema = z
  .object({
    start: dateTimeSchema.optional(),
    stop: dateTimeSchema.optional(),
    calculationMode: z.enum(["delta", "sum"]).default("delta"),
  })
  .superRefine(validateDateRange);

export const streamQuerySchema = z.object({
  devEui: z
    .string()
    .trim()
    .transform(normalizeDevEui)
    .refine(isValidDevEui, {
      message: "devEui must be a valid 16-character hexadecimal identifier.",
    })
    .optional(),
  pollMs: z.coerce.number().int().min(1000).max(15000).default(3000),
});

export const forecastQuerySchema = z.object({
  lookbackHours: z.coerce.number().int().min(24).max(2160).default(720),
  horizonHours: z.coerce.number().int().min(1).max(168).default(24),
  stepHours: z.coerce.number().int().min(1).max(24).default(3),
});

export type ReadingsQueryInput = z.infer<typeof readingsQuerySchema>;
export type CostQueryInput = z.infer<typeof costQuerySchema>;
export type StreamQueryInput = z.infer<typeof streamQuerySchema>;
export type ForecastQueryInput = z.infer<typeof forecastQuerySchema>;

export function resolveDateRange(input: {
  start?: string;
  stop?: string;
  defaultLookbackHours: number;
}) {
  const stop = input.stop ? new Date(input.stop) : new Date();

  const start = input.start
    ? new Date(input.start)
    : new Date(stop.getTime() - input.defaultLookbackHours * 60 * 60 * 1000);

  return { start, stop };
}
