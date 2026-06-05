export const UTILITY_TYPES = [
  "ELECTRICITY",
  "GAS",
  "WATER",
  "HEATING",
  "COOLING",
] as const;

export const KNOWN_UTILITY_TYPES = [...UTILITY_TYPES, "OTHER"] as const;

export type UtilityType = (typeof KNOWN_UTILITY_TYPES)[number];

export function isUtilityType(value: string): value is UtilityType {
  return (KNOWN_UTILITY_TYPES as readonly string[]).includes(value);
}

export function defaultUnitLabelForUtilityType(utilityType: UtilityType) {
  switch (utilityType) {
    case "ELECTRICITY":
      return "kWh";
    case "GAS":
      return "m3";
    case "WATER":
      return "m3";
    case "HEATING":
      return "kWh";
    case "COOLING":
      return "kWh";
    case "OTHER":
    default:
      return "unit";
  }
}

export function utilityTypeLabel(utilityType: UtilityType) {
  switch (utilityType) {
    case "ELECTRICITY":
      return "Electricity";
    case "GAS":
      return "Gas";
    case "WATER":
      return "Water";
    case "HEATING":
      return "Heating";
    case "COOLING":
      return "Cooling";
    case "OTHER":
    default:
      return "Other";
  }
}
