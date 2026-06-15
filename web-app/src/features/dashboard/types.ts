import type { MeterReading } from "@/lib/services/influx.service";
import type { UtilityType } from "@/lib/utility";
import type { DashboardLanguage } from "./i18n";

export type UserRole = "ADMIN" | "CUSTOMER";
export type CustomerType = "INDIVIDUAL" | "COMPANY";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  customerType: CustomerType | null;
};

export type PublicDevice = {
  id: string;
  devEui: string;
  name: string;
  utilityType: UtilityType;
  tariffPerUnit: number;
  unitLabel: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type DeviceCostResult = {
  calculationMode: "delta" | "sum";
  consumedUnits: number;
  tariffPerUnit: number;
  unitLabel: string;
  estimatedCost: number;
  period: {
    start: string;
    stop: string;
  };
  details: {
    sumUnits: number;
    firstValueUnits: number;
    lastValueUnits: number;
    deltaUnits: number;
  };
};

export type MeResponse = {
  user: PublicUser;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
  claim?: {
    status: string;
    claimedCount?: number;
  } | null;
};

export type DevicesResponse = {
  devices: PublicDevice[];
};

export type ClaimDevicesResponse = {
  claimedCount: number;
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

export type ForecastPoint = {
  timestamp: string;
  value: number;
  lower: number | null;
  upper: number | null;
};

export type ForecastResponse = {
  device: PublicDevice;
  query: {
    start: string;
    stop: string;
    lookbackHours: number;
    horizonHours: number;
    stepHours: number;
  };
  observed: MeterReading[];
  forecast: ForecastPoint[];
  model: {
    status: "ok" | "insufficient_data" | "model_error" | "service_unavailable";
    order: [number, number, number] | null;
    metadata: Record<string, number | string | null>;
  };
  estimate: {
    forecastedDeltaUnits: number;
    tariffPerUnit: number;
    unitLabel: string;
    estimatedCost: number;
  };
};

export type UtilityCategorySummary = {
  utilityType: UtilityType;
  unitLabel: string;
  deviceCount: number;
  activeDeviceCount: number;
  today: {
    consumedUnits: number;
    estimatedCost: number;
  };
  week: {
    consumedUnits: number;
    estimatedCost: number;
  };
  month: {
    consumedUnits: number;
    estimatedCost: number;
  };
};

export type FleetSummary = {
  period: {
    todayStart: string;
    weekStart: string;
    monthStart: string;
    stop: string;
  };
  totals: {
    deviceCount: number;
    activeDeviceCount: number;
    utilityCategoryCount: number;
    todayEstimatedCost: number;
    weekEstimatedCost: number;
    monthEstimatedCost: number;
  };
  categories: UtilityCategorySummary[];
};

export type FleetSummaryResponse = {
  summary: FleetSummary;
};

export type ViewKey = "overview" | "devices" | "meter" | "billing";
export type AuthMode = "login" | "register";
export type DeviceRuntimeStatus = "connected" | "heartbeat" | "error" | "inactive";
export type StatusFilter = "all" | DeviceRuntimeStatus;

export type DeviceRow = {
  device: PublicDevice;
  reading: MeterReading | null;
  latestConsumption: number | null;
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
  customerType: CustomerType;
  claimCode: string;
  email: string;
  password: string;
};

export type CreateDeviceFormState = {
  devEui: string;
  name: string;
  utilityType: UtilityType;
  tariffPerUnit: string;
  unitLabel: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
};

export type UpdateDeviceFormState = {
  name: string;
  utilityType: UtilityType;
  tariffPerUnit: string;
  unitLabel: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
};

export type DashboardPageProps = {
  initialView?: ViewKey;
};

export type { DashboardLanguage };
