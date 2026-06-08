"use client";

import { Fragment, useEffect } from "react";
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
}: FitBoundsControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (devices.length === 0) {
      map.setView(defaultCenter, defaultZoom);
      return;
    }

    const bounds = latLngBounds(
      devices.map((device) => [device.latitude, device.longitude] as [number, number]),
    );
    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: 15,
    });
  }, [map, devices, defaultCenter, defaultZoom]);

  return null;
}

export default function DeviceMapCanvas({
  devices,
  selectedDevEui,
  onSelectDevice,
  defaultCenter,
  defaultZoom,
}: DeviceMapCanvasProps) {
  return (
    <div className="h-[600px] min-h-[560px] overflow-hidden rounded-xl xl:h-[700px]">
      <MapContainer center={defaultCenter} zoom={defaultZoom} className="h-full w-full" scrollWheelZoom>
        <FitBoundsController
          devices={devices}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
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
    </div>
  );
}
