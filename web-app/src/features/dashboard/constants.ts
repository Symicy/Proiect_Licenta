import type { NavItem, ViewKey } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", subtitle: "Fleet snapshot", icon: "dashboard" },
  { key: "devices", label: "Devices", subtitle: "Inventory", icon: "bolt" },
  { key: "map", label: "Map", subtitle: "Device locations", icon: "map" },
  { key: "meter", label: "Meter", subtitle: "Live details", icon: "insights" },
  { key: "billing", label: "Billing", subtitle: "Cost summary", icon: "payments" },
];

export const VIEW_PATHS: Record<ViewKey, string> = {
  overview: "/home",
  devices: "/devices",
  map: "/map",
  meter: "/meter",
  billing: "/billing",
};
