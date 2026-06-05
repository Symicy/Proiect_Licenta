import { Pool } from "pg";
import type { CustomerType } from "@prisma/client";

import prisma from "@/lib/prisma";
import { hashClaimCode } from "@/lib/services/claim-code.service";
import {
  defaultUnitLabelForUtilityType,
  isUtilityType,
  type UtilityType,
} from "@/lib/utility";

const globalForChirpStack = globalThis as unknown as {
  chirpStackPool?: Pool;
};

type ChirpStackMetadata = Record<string, unknown>;

type ChirpStackDeviceRow = {
  devEui: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  isDisabled: boolean;
  tags: ChirpStackMetadata;
  variables: ChirpStackMetadata;
};

type ImportedChirpStackDevice = {
  devEui: string;
  name: string;
  utilityType: UtilityType;
  tariffPerUnit: number;
  unitLabel: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  claimCodeHash: string | null;
  claimCodeLabel: string | null;
  claimCodeCustomerType: CustomerType | null;
  ownerEmail: string | null;
};

function getChirpStackDatabaseUrl() {
  return (
    process.env.CHIRPSTACK_DATABASE_URL ??
    "postgresql://admin:secretpassword@localhost:5432/chirpstack?sslmode=disable"
  );
}

function getPool() {
  if (globalForChirpStack.chirpStackPool) {
    return globalForChirpStack.chirpStackPool;
  }

  const pool = new Pool({
    connectionString: getChirpStackDatabaseUrl(),
    connectionTimeoutMillis: 1000,
    idleTimeoutMillis: 5000,
    max: 2,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForChirpStack.chirpStackPool = pool;
  }

  return pool;
}

function isMetadataRecord(value: unknown): value is ChirpStackMetadata {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readMetadataString(metadata: ChirpStackMetadata, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function readMetadataNumber(metadata: ChirpStackMetadata, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeCustomerType(value: string | null): CustomerType | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized === "INDIVIDUAL" || normalized === "COMPANY" ? normalized : null;
}

function normalizeUtilityType(value: string | null): UtilityType | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return isUtilityType(normalized) ? normalized : null;
}

function resolveClaimCodeHash(metadata: ChirpStackMetadata) {
  const explicitHash = readMetadataString(metadata, ["claimCodeHash", "claim_code_hash"]);
  if (explicitHash) {
    return explicitHash.toLowerCase();
  }

  const plainClaimCode = readMetadataString(metadata, ["claimCode", "claim_code"]);
  return plainClaimCode ? hashClaimCode(plainClaimCode) : null;
}

function mapChirpStackDevice(row: ChirpStackDeviceRow): ImportedChirpStackDevice {
  const tags = isMetadataRecord(row.tags) ? row.tags : {};
  const variables = isMetadataRecord(row.variables) ? row.variables : {};
  const mergedMetadata = { ...tags, ...variables };

  const utilityType =
    normalizeUtilityType(readMetadataString(mergedMetadata, ["utilityType", "utility_type", "meterType"])) ??
    "ELECTRICITY";
  const tariffPerUnit = readMetadataNumber(mergedMetadata, ["tariffPerUnit", "tariff_per_unit"]) ?? 0.25;
  const unitLabel =
    readMetadataString(mergedMetadata, ["unitLabel", "unit_label", "unit"]) ??
    defaultUnitLabelForUtilityType(utilityType);

  return {
    devEui: row.devEui,
    name: row.name,
    utilityType,
    tariffPerUnit,
    unitLabel,
    isActive: !row.isDisabled,
    latitude: row.latitude,
    longitude: row.longitude,
    claimCodeHash: resolveClaimCodeHash(mergedMetadata),
    claimCodeLabel: readMetadataString(mergedMetadata, ["claimCodeLabel", "claim_code_label"]),
    claimCodeCustomerType: normalizeCustomerType(
      readMetadataString(mergedMetadata, ["claimCodeCustomerType", "claim_code_customer_type", "customerType"]),
    ),
    ownerEmail: readMetadataString(mergedMetadata, ["ownerEmail", "owner_email", "appOwnerEmail", "app_owner_email"])?.toLowerCase() ?? null,
  };
}

async function listChirpStackDevices() {
  if (process.env.CHIRPSTACK_METADATA_SYNC_ENABLED === "false") {
    return [];
  }

  const query = `
    SELECT
      encode(dev_eui, 'hex') AS "devEui",
      name,
      latitude,
      longitude,
      is_disabled AS "isDisabled",
      tags,
      variables
    FROM device
  `;

  try {
    const result = await getPool().query<ChirpStackDeviceRow>(query);
    return result.rows.map(mapChirpStackDevice);
  } catch (error) {
    console.warn("Failed to sync ChirpStack inventory:", error);
    return [];
  }
}

export async function syncChirpStackInventory() {
  const chirpStackDevices = await listChirpStackDevices();
  if (chirpStackDevices.length === 0) {
    return { syncedCount: 0 };
  }

  const ownerEmails = [...new Set(chirpStackDevices.map((device) => device.ownerEmail).filter(Boolean))] as string[];
  const ownerUsers = ownerEmails.length > 0
    ? await prisma.user.findMany({
        where: {
          email: {
            in: ownerEmails,
          },
        },
        select: {
          id: true,
          email: true,
        },
      })
    : [];
  const ownerByEmail = new Map(ownerUsers.map((user) => [user.email.toLowerCase(), user]));
  const existingDevices = await prisma.device.findMany({
    where: {
      devEui: {
        in: chirpStackDevices.map((device) => device.devEui),
      },
    },
  });
  const existingByDevEui = new Map(existingDevices.map((device) => [device.devEui, device]));
  const now = new Date();
  let syncedCount = 0;

  for (const device of chirpStackDevices) {
    const owner = device.ownerEmail ? ownerByEmail.get(device.ownerEmail) : null;
    const existing = existingByDevEui.get(device.devEui);
    const baseData = {
      name: device.name,
      utilityType: device.utilityType,
      tariffPerUnit: device.tariffPerUnit,
      unitLabel: device.unitLabel,
      isActive: device.isActive,
      latitude: device.latitude,
      longitude: device.longitude,
      claimCodeHash: device.claimCodeHash,
      claimCodeLabel: device.claimCodeLabel,
      claimCodeCustomerType: device.claimCodeCustomerType,
    };

    if (!existing) {
      await prisma.device.create({
        data: {
          devEui: device.devEui,
          ...baseData,
          userId: owner?.id ?? null,
          claimedAt: owner ? now : null,
        },
      });
      syncedCount += 1;
      continue;
    }

    const ownershipData =
      owner && (!existing.claimedAt || existing.userId === owner.id)
        ? {
            userId: owner.id,
            claimedAt: existing.claimedAt ?? now,
          }
        : {};

    await prisma.device.update({
      where: { devEui: device.devEui },
      data: {
        ...baseData,
        ...ownershipData,
      },
    });
    syncedCount += 1;
  }

  return { syncedCount };
}
