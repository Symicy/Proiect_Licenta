import type { Device, UtilityType } from "@prisma/client";

import prisma from "@/lib/prisma";
import { syncChirpStackInventory } from "@/lib/services/chirpstack-inventory.service";
import { normalizeDevEui } from "@/lib/validation/device";
import { listSimulatorDevices, type SimulatorDiscoveredDevice } from "@/lib/services/simulator.service";
import { defaultUnitLabelForUtilityType } from "@/lib/utility";

const simulatorSyncCache = new Map<string, number>();

export type PublicDevice = {
  id: string;
  devEui: string;
  name: string;
  utilityType: UtilityType;
  tariffPerUnit: number;
  unitLabel: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDeviceForUserInput = {
  devEui: string;
  name: string;
  utilityType: UtilityType;
  tariffPerUnit: number;
  unitLabel?: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateDeviceForUserInput = {
  name?: string;
  utilityType?: UtilityType;
  tariffPerUnit?: number;
  unitLabel?: string;
  isActive?: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

type DeviceOwnerResolution =
  | { status: "not-found" }
  | { status: "forbidden" }
  | { status: "ok"; device: Device };

export type CreateDeviceForUserResult =
  | { status: "created"; device: PublicDevice }
  | { status: "already-owned"; device: PublicDevice }
  | { status: "owned-by-other-user" };

export type UserDeviceLookupResult =
  | { status: "found"; device: PublicDevice }
  | { status: "not-found" }
  | { status: "forbidden" };

export type UpdateDeviceForUserResult =
  | { status: "updated"; device: PublicDevice }
  | { status: "not-found" }
  | { status: "forbidden" };

export type DeleteDeviceForUserResult =
  | { status: "deleted"; device: PublicDevice }
  | { status: "not-found" }
  | { status: "forbidden" };

function toPublicDevice(device: Device): PublicDevice {
  return {
    id: device.id,
    devEui: device.devEui,
    name: device.name,
    utilityType: device.utilityType,
    tariffPerUnit: device.tariffPerUnit,
    unitLabel: device.unitLabel,
    isActive: device.isActive,
    latitude: device.latitude,
    longitude: device.longitude,
    userId: device.userId ?? "",
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
  };
}

function resolveAutoProvisionTariffPerUnit() {
  const configuredTariff = Number(
    process.env.AUTO_DEVICE_TARIFF_PER_UNIT ?? process.env.AUTO_DEVICE_ENERGY_TARIFF ?? "0.25",
  );
  if (!Number.isFinite(configuredTariff) || configuredTariff < 0) {
    return 0.25;
  }

  return configuredTariff;
}

function resolveSimulatorSyncMinIntervalMs() {
  const configured = Number(process.env.SIMULATOR_SYNC_MIN_INTERVAL_MS ?? "15000");
  if (!Number.isFinite(configured) || configured < 0) {
    return 15000;
  }

  return configured;
}

function shouldSyncFromSimulator(userId: string) {
  const intervalMs = resolveSimulatorSyncMinIntervalMs();
  const now = Date.now();
  const lastSyncAt = simulatorSyncCache.get(userId) ?? 0;

  if (now - lastSyncAt < intervalMs) {
    return false;
  }

  simulatorSyncCache.set(userId, now);
  return true;
}

async function syncDevicesFromExternalSourcesForUser(userId: string) {
  if (!shouldSyncFromSimulator(userId)) {
    return;
  }

  await syncChirpStackInventory();
  await syncDevicesFromSimulatorForUser(userId);
}

function hasCoordinateDifference(existing: Device, discovered: SimulatorDiscoveredDevice) {
  return existing.latitude !== discovered.latitude || existing.longitude !== discovered.longitude;
}

function resolveUnitLabel(unitLabel: string | undefined, utilityType: UtilityType) {
  const normalized = unitLabel?.trim();
  if (normalized && normalized.length > 0) {
    return normalized;
  }

  return defaultUnitLabelForUtilityType(utilityType);
}

async function syncDevicesFromSimulatorForUser(userId: string) {
  const discoveredDevices = await listSimulatorDevices();
  if (discoveredDevices.length === 0) {
    return;
  }

  const discoveredDevEuis = discoveredDevices.map((device) => device.devEui);
  const existingDevices = await prisma.device.findMany({
    where: {
      devEui: {
        in: discoveredDevEuis,
      },
    },
  });

  const existingByDevEui = new Map(existingDevices.map((device) => [device.devEui, device]));
  const defaultTariff = resolveAutoProvisionTariffPerUnit();

  for (const discoveredDevice of discoveredDevices) {
    const existingDevice = existingByDevEui.get(discoveredDevice.devEui);

    if (!existingDevice) {
      try {
        const created = await prisma.device.create({
          data: {
            devEui: discoveredDevice.devEui,
            name: discoveredDevice.name,
            utilityType: discoveredDevice.utilityType,
            tariffPerUnit: defaultTariff,
            unitLabel: discoveredDevice.unitLabel,
            isActive: discoveredDevice.isActive,
            latitude: discoveredDevice.latitude,
            longitude: discoveredDevice.longitude,
            userId,
            claimedAt: new Date(),
          },
        });

        existingByDevEui.set(discoveredDevice.devEui, created);
      } catch {
        // Another user might have claimed this devEui first.
      }

      continue;
    }

    if (existingDevice.userId !== userId) {
      continue;
    }

    if (!hasCoordinateDifference(existingDevice, discoveredDevice)) {
      continue;
    }

    const updated = await prisma.device.update({
      where: {
        devEui: discoveredDevice.devEui,
      },
      data: {
        latitude: discoveredDevice.latitude,
        longitude: discoveredDevice.longitude,
      },
    });

    existingByDevEui.set(discoveredDevice.devEui, updated);
  }
}

async function resolveDeviceOwnership(userId: string, rawDevEui: string): Promise<DeviceOwnerResolution> {
  const devEui = normalizeDevEui(rawDevEui);
  const existingDevice = await prisma.device.findUnique({
    where: { devEui },
  });

  if (!existingDevice) {
    return { status: "not-found" };
  }

  if (existingDevice.userId !== userId) {
    return { status: "forbidden" };
  }

  return { status: "ok", device: existingDevice };
}

export async function listDevicesForUser(userId: string) {
  await syncDevicesFromExternalSourcesForUser(userId);

  const devices = await prisma.device.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return devices.map(toPublicDevice);
}

export async function createDeviceForUser(
  userId: string,
  input: CreateDeviceForUserInput,
): Promise<CreateDeviceForUserResult> {
  const devEui = normalizeDevEui(input.devEui);
  const existingDevice = await prisma.device.findUnique({
    where: { devEui },
  });

  if (existingDevice) {
    if (existingDevice.userId === userId) {
      return {
        status: "already-owned",
        device: toPublicDevice(existingDevice),
      };
    }

    return { status: "owned-by-other-user" };
  }

  const utilityType = input.utilityType;
  const unitLabel = resolveUnitLabel(input.unitLabel, utilityType);

  const createdDevice = await prisma.device.create({
    data: {
      devEui,
      name: input.name.trim(),
      utilityType,
      tariffPerUnit: input.tariffPerUnit,
      unitLabel,
      isActive: input.isActive,
      latitude: input.latitude,
      longitude: input.longitude,
      userId,
      claimedAt: new Date(),
    },
  });

  return {
    status: "created",
    device: toPublicDevice(createdDevice),
  };
}

export async function getDeviceForUserByDevEui(
  userId: string,
  rawDevEui: string,
): Promise<UserDeviceLookupResult> {
  const ownership = await resolveDeviceOwnership(userId, rawDevEui);

  if (ownership.status === "not-found") {
    return { status: "not-found" };
  }

  if (ownership.status === "forbidden") {
    return { status: "forbidden" };
  }

  return {
    status: "found",
    device: toPublicDevice(ownership.device),
  };
}

export async function updateDeviceForUserByDevEui(
  userId: string,
  rawDevEui: string,
  input: UpdateDeviceForUserInput,
): Promise<UpdateDeviceForUserResult> {
  const ownership = await resolveDeviceOwnership(userId, rawDevEui);

  if (ownership.status === "not-found") {
    return { status: "not-found" };
  }

  if (ownership.status === "forbidden") {
    return { status: "forbidden" };
  }

  const nextUtilityType = input.utilityType ?? ownership.device.utilityType;
  const nextUnitLabel =
    input.unitLabel !== undefined
      ? resolveUnitLabel(input.unitLabel, nextUtilityType)
      : input.utilityType !== undefined
        ? defaultUnitLabelForUtilityType(nextUtilityType)
        : undefined;

  const updatedDevice = await prisma.device.update({
    where: { devEui: ownership.device.devEui },
    data: {
      name: input.name?.trim(),
      utilityType: input.utilityType,
      tariffPerUnit: input.tariffPerUnit,
      unitLabel: nextUnitLabel,
      isActive: input.isActive,
      latitude: input.latitude,
      longitude: input.longitude,
    },
  });

  return {
    status: "updated",
    device: toPublicDevice(updatedDevice),
  };
}

export async function deleteDeviceForUserByDevEui(
  userId: string,
  rawDevEui: string,
): Promise<DeleteDeviceForUserResult> {
  const ownership = await resolveDeviceOwnership(userId, rawDevEui);

  if (ownership.status === "not-found") {
    return { status: "not-found" };
  }

  if (ownership.status === "forbidden") {
    return { status: "forbidden" };
  }

  const deletedDevice = await prisma.device.delete({
    where: {
      devEui: ownership.device.devEui,
    },
  });

  return {
    status: "deleted",
    device: toPublicDevice(deletedDevice),
  };
}
