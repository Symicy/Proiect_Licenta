"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { latLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

import type { UtilityType } from "@/lib/utility";

type DeviceWithCoordinates = {
  id: string;
  devEui: string;
  name: string;
  utilityType: UtilityType;
  latitude: number;
  longitude: number;
};

type DeviceMapCanvasProps = {
  devices: DeviceWithCoordinates[];
  selectedDevEui: string | null;
  onSelectDevice: (devEui: string) => void;
  defaultCenter: [number, number];
  defaultZoom: number;
};

type FitBoundsControllerProps = {
  devices: DeviceWithCoordinates[];
  defaultCenter: [number, number];
  defaultZoom: number;
  resetViewSignal: number;
};

const MAP_MARKER_COLORS: Record<UtilityType, string> = {
  ELECTRICITY: "#facc15",
  GAS: "#fb923c",
  WATER: "#38bdf8",
  HEATING: "#f87171",
  COOLING: "#60a5fa",
  OTHER: "#a7f3d0",
};

function markerColor(utilityType: UtilityType) {
  return MAP_MARKER_COLORS[utilityType] ?? "#c0c1ff";
}

function FitBoundsController({
  devices,
  defaultCenter,
  defaultZoom,
  resetViewSignal,
}: FitBoundsControllerProps) {
  const map = useMap();
  const fittingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const lastFitSignatureRef = useRef<string | null>(null);
  const lastResetSignalRef = useRef(resetViewSignal);
  const devicesSignature = useMemo(
    () => devices.map((device) => device.devEui).sort().join("|"),
    [devices],
  );

  useEffect(() => {
    const markUserInteracted = () => {
      if (!fittingRef.current) {
        userInteractedRef.current = true;
      }
    };

    map.on("dragstart", markUserInteracted);
    map.on("zoomstart", markUserInteracted);

    return () => {
      map.off("dragstart", markUserInteracted);
      map.off("zoomstart", markUserInteracted);
    };
  }, [map]);

  useEffect(() => {
    const isResetRequested = resetViewSignal !== lastResetSignalRef.current;
    if (isResetRequested) {
      userInteractedRef.current = false;
      lastResetSignalRef.current = resetViewSignal;
    }

    if (
      userInteractedRef.current &&
      devicesSignature === lastFitSignatureRef.current &&
      !isResetRequested
    ) {
      return;
    }

    fittingRef.current = true;

    if (devices.length === 0) {
      map.setView(defaultCenter, defaultZoom);
    } else {
      const bounds = latLngBounds(
        devices.map((device) => [device.latitude, device.longitude] as [number, number]),
      );
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15,
      });
    }

    lastFitSignatureRef.current = devicesSignature;
    const timer = window.setTimeout(() => {
      fittingRef.current = false;
    }, 450);

    return () => window.clearTimeout(timer);
  }, [map, devices, devicesSignature, defaultCenter, defaultZoom, resetViewSignal]);

  return null;
}

export default function DeviceMapCanvas({
  devices,
  selectedDevEui,
  onSelectDevice,
  defaultCenter,
  defaultZoom,
}: DeviceMapCanvasProps) {
  const [resetViewSignal, setResetViewSignal] = useState(0);

  return (
    <div className="relative h-[clamp(540px,calc(100vh-290px),790px)] min-h-[540px] overflow-hidden rounded-xl">
      <MapContainer center={defaultCenter} zoom={defaultZoom} className="h-full w-full" scrollWheelZoom>
        <FitBoundsController
          devices={devices}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          resetViewSignal={resetViewSignal}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {devices.map((device) => {
          const isSelected = device.devEui === selectedDevEui;
          const color = markerColor(device.utilityType);
          return (
            <Fragment key={device.id}>
              {isSelected ? (
                <CircleMarker
                  center={[device.latitude, device.longitude]}
                  radius={22}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.16,
                    opacity: 0.95,
                    weight: 3,
                  }}
                  interactive={false}
                />
              ) : null}
              <CircleMarker
                center={[device.latitude, device.longitude]}
                radius={isSelected ? 15 : 8}
                pathOptions={{
                  color: isSelected ? "#ffffff" : "#06101f",
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.92,
                  opacity: 1,
                  weight: isSelected ? 4 : 2,
                }}
                eventHandlers={{
                  click: () => onSelectDevice(device.devEui),
                }}
              >
                <Popup>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0 }}>{device.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px" }}>{device.devEui}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                      {device.latitude.toFixed(5)}, {device.longitude.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>
      <button
        type="button"
        className="absolute right-3 top-3 z-[500] rounded-md bg-white/95 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-800 shadow-md transition hover:bg-white"
        onClick={() => setResetViewSignal((value) => value + 1)}
      >
        Reset view
      </button>
    </div>
  );
}
