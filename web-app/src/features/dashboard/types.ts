import type { MeterReading } from "@/lib/services/influx.service";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CUSTOMER";
};

export type PublicDevice = {
  id: string;
  devEui: string;
  name: string;
  energyTariff: number;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type DeviceCostResult = {
  calculationMode: "delta" | "sum";
  consumedKwh: number;
  energyTariff: number;
  estimatedCost: number;
  period: {
    start: string;
    stop: string;
  };
  details: {
    sumKwh: number;
    firstValueKwh: number;
    lastValueKwh: number;
    deltaKwh: number;
  };
};

export type MeResponse = {
  user: PublicUser;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
};

export type DevicesResponse = {
  devices: PublicDevice[];
};

export type LatestReadingResponse = {
  device: PublicDevice;
  reading: MeterReading | null;
};

export type RangeReadingsResponse = {
  device: PublicDevice;
  readings: MeterReading[];
};

export type CostResponse = {
  device: PublicDevice;
  cost: DeviceCostResult;
};

export type ViewKey = "overview" | "devices" | "meter" | "billing";
export type AuthMode = "login" | "register";
export type DeviceRuntimeStatus = "connected" | "heartbeat" | "error" | "inactive";
export type StatusFilter = "all" | DeviceRuntimeStatus;

export type DeviceRow = {
  device: PublicDevice;
  reading: MeterReading | null;
  loadWatts: number | null;
  status: DeviceRuntimeStatus;
  lastSeen: string;
  liveCost: number | null;
};

export type AlertItem = {
  id: string;
  title: string;
  body: string;
  level: "info" | "error";
};

export type NavItem = {
  key: ViewKey;
  label: string;
  subtitle: string;
  icon: string;
};

export type AuthFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type CreateDeviceFormState = {
  devEui: string;
  name: string;
  energyTariff: string;
  isActive: boolean;
};

export type DashboardPageProps = {
  initialView?: ViewKey;
};
