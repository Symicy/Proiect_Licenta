import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, serverError, unauthorized, validationError } from "@/lib/api-response";
import { getRequestUserContext } from "@/lib/security/request-user";
import { getDeviceForUserByDevEui, listDevicesForUser } from "@/lib/services/device.service";
import { getLatestReadingByDevEui, type MeterReading } from "@/lib/services/influx.service";
import { streamQuerySchema } from "@/lib/validation/telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LOOKBACK_HOURS = 24;

type StreamDevice = {
  devEui: string;
  name: string;
  energyTariff: number;
  isActive: boolean;
};

type MeterReadingEvent = {
  devEui: string;
  deviceName: string;
  energyTariff: number;
  estimatedCostAtReading: number | null;
  reading: MeterReading;
};

function buildSseMessage(event: string, data: unknown, id?: string) {
  let message = "";

  if (id) {
    message += `id: ${id}\n`;
  }

  message += `event: ${event}\n`;
  message += `data: ${JSON.stringify(data)}\n\n`;

  return message;
}

export async function GET(request: NextRequest) {
  try {
    const userContext = getRequestUserContext(request);
    if (!userContext) {
      return unauthorized();
    }

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = streamQuerySchema.parse(rawQuery);

    if (query.devEui) {
      const ownership = await getDeviceForUserByDevEui(userContext.userId, query.devEui);

      if (ownership.status === "not-found") {
        return errorResponse("Device not found.", 404);
      }

      if (ownership.status === "forbidden") {
        return errorResponse("You do not have access to this device.", 403);
      }
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        let intervalId: NodeJS.Timeout | null = null;
        const connectionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const lastSeenByDevice = new Map<string, string>();

        const sendEvent = (event: string, data: unknown, id?: string) => {
          if (closed) {
            return;
          }

          controller.enqueue(encoder.encode(buildSseMessage(event, data, id)));
        };

        const closeStream = () => {
          if (closed) {
            return;
          }

          closed = true;

          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          controller.close();
        };

        const resolveTargetDevices = async (): Promise<StreamDevice[]> => {
          if (query.devEui) {
            const ownership = await getDeviceForUserByDevEui(userContext.userId, query.devEui);

            if (ownership.status !== "found") {
              return [];
            }

            return [ownership.device];
          }

          return listDevicesForUser(userContext.userId);
        };

        const emitSnapshot = async (isInitialSnapshot: boolean) => {
          const now = new Date();
          const start = new Date(now.getTime() - DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000);

          const devices = await resolveTargetDevices();

          if (isInitialSnapshot) {
            sendEvent("connected", {
              connectionId,
              pollMs: query.pollMs,
              deviceCount: devices.length,
              at: now.toISOString(),
            });
          }

          await Promise.all(
            devices.map(async (device) => {
              if (!device.isActive) {
                return;
              }

              const latest = await getLatestReadingByDevEui({
                devEui: device.devEui,
                start,
                stop: now,
              });

              if (!latest) {
                return;
              }

              const previousTimestamp = lastSeenByDevice.get(device.devEui);
              if (previousTimestamp === latest.timestamp) {
                return;
              }

              lastSeenByDevice.set(device.devEui, latest.timestamp);

              const payload: MeterReadingEvent = {
                devEui: device.devEui,
                deviceName: device.name,
                energyTariff: device.energyTariff,
                estimatedCostAtReading:
                  latest.energy !== null ? latest.energy * device.energyTariff : null,
                reading: latest,
              };

              sendEvent("meter-reading", payload, `${device.devEui}:${latest.timestamp}`);
            }),
          );

          sendEvent("heartbeat", {
            at: now.toISOString(),
          });
        };

        const poll = async (isInitialSnapshot: boolean) => {
          try {
            await emitSnapshot(isInitialSnapshot);
          } catch (error) {
            sendEvent("stream-error", {
              message: "Failed to query latest device readings.",
              details: error instanceof Error ? error.message : "unknown",
            });
          }
        };

        void poll(true);

        intervalId = setInterval(() => {
          void poll(false);
        }, query.pollMs);

        request.signal.addEventListener("abort", () => {
          closeStream();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error.flatten());
    }

    return serverError(error);
  }
}
