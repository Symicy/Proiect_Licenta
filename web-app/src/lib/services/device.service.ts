import type { Device } from "@prisma/client";

import prisma from "@/lib/prisma";
import { normalizeDevEui } from "@/lib/validation/device";

export type PublicDevice = {
  id: string;
  devEui: string;
  name: string;
  energyTariff: number;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDeviceForUserInput = {
  devEui: string;
  name: string;
  energyTariff: number;
  isActive: boolean;
};

export type UpdateDeviceForUserInput = {
  name?: string;
  energyTariff?: number;
  isActive?: boolean;
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
    energyTariff: device.energyTariff,
    isActive: device.isActive,
    userId: device.userId,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
  };
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

  const createdDevice = await prisma.device.create({
    data: {
      devEui,
      name: input.name.trim(),
      energyTariff: input.energyTariff,
      isActive: input.isActive,
      userId,
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

  const updatedDevice = await prisma.device.update({
    where: { devEui: ownership.device.devEui },
    data: {
      name: input.name?.trim(),
      energyTariff: input.energyTariff,
      isActive: input.isActive,
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
