"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { MeterReading } from "@/lib/services/influx.service";
import type { UtilityType } from "@/lib/utility";

type StreamConnectionStatus = "idle" | "connecting" | "open" | "error" | "closed";

type MeterReadingEvent = {
  devEui: string;
  deviceName: string;
  utilityType: UtilityType;
  tariffPerUnit: number;
  unitLabel: string;
  estimatedCostAtReading: number | null;
  reading: MeterReading;
};

type ConnectedEvent = {
  connectionId: string;
  pollMs: number;
  deviceCount: number;
  at: string;
};

type HeartbeatEvent = {
  at: string;
};

type StreamErrorEvent = {
  message: string;
  details?: string;
};

export type UseDeviceSseOptions = {
  enabled?: boolean;
  devEui?: string;
  pollMs?: number;
  endpoint?: string;
};

export function useDeviceSse(options: UseDeviceSseOptions = {}) {
  const [status, setStatus] = useState<StreamConnectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectedEvent | null>(null);
  const [latestByDevice, setLatestByDevice] = useState<Record<string, MeterReadingEvent>>({});
  const [lastReadingEvent, setLastReadingEvent] = useState<MeterReadingEvent | null>(null);
  const [lastReadingAt, setLastReadingAt] = useState<string | null>(null);
  const [readingVersion, setReadingVersion] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);

  const enabled = options.enabled ?? true;
  const endpoint = options.endpoint ?? "/api/devices/stream";

  const streamUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (options.devEui) {
      params.set("devEui", options.devEui.trim().toLowerCase());
    }

    if (options.pollMs) {
      params.set("pollMs", String(options.pollMs));
    }

    const queryString = params.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }, [endpoint, options.devEui, options.pollMs]);

  const connectionStatus: StreamConnectionStatus =
    enabled && status === "idle" ? "connecting" : enabled ? status : "idle";

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const eventSource = new EventSource(streamUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    const onConnected = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as ConnectedEvent;
        setConnectionInfo(payload);
      } catch {
        setErrorMessage("Failed to parse connected event payload.");
      }
    };

    const onReading = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as MeterReadingEvent;

        setLatestByDevice((previous) => ({
          ...previous,
          [payload.devEui]: payload,
        }));
        setLastReadingEvent(payload);
        setLastReadingAt(payload.reading.timestamp);
        setReadingVersion((current) => current + 1);
      } catch {
        setErrorMessage("Failed to parse meter-reading payload.");
      }
    };

    const onHeartbeat = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as HeartbeatEvent;
        setLastHeartbeatAt(payload.at);
      } catch {
        setLastHeartbeatAt(new Date().toISOString());
      }
    };

    const onStreamError = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as StreamErrorEvent;
        setErrorMessage(payload.details ? `${payload.message}: ${payload.details}` : payload.message);
      } catch {
        setErrorMessage("Received stream-error event.");
      }
    };

    eventSource.onopen = () => {
      setStatus("open");
      setErrorMessage(null);
    };

    eventSource.onerror = () => {
      setStatus("error");
      setErrorMessage("EventSource connection failed or was interrupted.");
    };

    eventSource.addEventListener("connected", onConnected as EventListener);
    eventSource.addEventListener("meter-reading", onReading as EventListener);
    eventSource.addEventListener("heartbeat", onHeartbeat as EventListener);
    eventSource.addEventListener("stream-error", onStreamError as EventListener);

    return () => {
      eventSource.removeEventListener("connected", onConnected as EventListener);
      eventSource.removeEventListener("meter-reading", onReading as EventListener);
      eventSource.removeEventListener("heartbeat", onHeartbeat as EventListener);
      eventSource.removeEventListener("stream-error", onStreamError as EventListener);

      eventSource.close();
      eventSourceRef.current = null;
      setStatus("closed");
    };
  }, [enabled, streamUrl]);

  return {
    status: connectionStatus,
    errorMessage,
    connectionInfo,
    lastHeartbeatAt,
    latestByDevice,
    lastReadingEvent,
    lastReadingAt,
    readingVersion,
  };
}
