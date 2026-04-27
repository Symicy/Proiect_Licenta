"use client";

import { useEffect } from "react";
import { latLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

type DeviceWithCoordinates = {
  id: string;
  devEui: string;
  name: string;
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
    <div className="h-[460px] overflow-hidden rounded-xl">
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
          return (
            <CircleMarker
              key={device.id}
              center={[device.latitude, device.longitude]}
              radius={isSelected ? 10 : 8}
              pathOptions={{
                color: isSelected ? "#c0c1ff" : "#4ae176",
                fillColor: isSelected ? "#c0c1ff" : "#4ae176",
                fillOpacity: isSelected ? 0.95 : 0.8,
                weight: 2,
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
          );
        })}
      </MapContainer>
    </div>
  );
}
