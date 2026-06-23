import { createHash, randomUUID } from "crypto";
import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import pg from "pg";
import { encodeSmartMeterPayload } from "./demo-telemetry-profile.mjs";

loadEnv({ path: new URL("../.env", import.meta.url) });

const { Pool } = pg;

const SIMULATOR_API_URL = (process.env.SIMULATOR_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const SIMULATOR_BRIDGE_ADDRESS = process.env.SIMULATOR_BRIDGE_ADDRESS ?? "chirpstack-gateway-bridge";
const SIMULATOR_BRIDGE_PORT = process.env.SIMULATOR_BRIDGE_PORT ?? "1700";
const APP_DATABASE_URL = process.env.DATABASE_URL;
const CHIRPSTACK_DATABASE_URL =
  process.env.CHIRPSTACK_DATABASE_URL ??
  "postgresql://admin:secretpassword@localhost:5432/chirpstack?sslmode=disable";
const SIMULATOR_CONTROL_TIMEOUT_MS = 15000;

const DEMO_PASSWORD = "Demo12345!";
const COMPANY_CLAIM_CODE = "COMPANY-DEMO-2026";
const USER_CLAIM_CODES = [
  "USER1-DEMO-2026",
  "USER2-DEMO-2026",
  "USER3-DEMO-2026",
];
const DEFAULT_GATEWAY_MAC = "a1b2c3d4e5f67890";
const DEFAULT_GATEWAY_NAME = "Gateway_Licenta";
const DEFAULT_BASE_LATITUDE = 47.6462928;
const DEFAULT_BASE_LONGITUDE = 23.5490119;
const DEFAULT_LWN_RXS = [
  {
    channel: {
      active: true,
      enableUplink: true,
      freqUplink: 868100000,
      freqDownlink: 868100000,
      minDR: 0,
      maxDR: 5,
    },
    delay: 5000,
    durationOpen: 3000,
    dataRate: 5,
  },
  {
    channel: {
      active: true,
      enableUplink: false,
      freqUplink: 869525000,
      freqDownlink: 869525000,
      minDR: 0,
      maxDR: 5,
    },
    delay: 5000,
    durationOpen: 3000,
    dataRate: 0,
  },
];

const DEMO_USERS = [
  {
    email: "company.demo@example.com",
    password: DEMO_PASSWORD,
    firstName: "Demo",
    lastName: "Company",
    customerType: "COMPANY",
    claimCode: COMPANY_CLAIM_CODE,
  },
  {
    email: "user1.demo@example.com",
    password: DEMO_PASSWORD,
    firstName: "Demo",
    lastName: "User One",
    customerType: "INDIVIDUAL",
    claimCode: USER_CLAIM_CODES[0],
  },
  {
    email: "user2.demo@example.com",
    password: DEMO_PASSWORD,
    firstName: "Demo",
    lastName: "User Two",
    customerType: "INDIVIDUAL",
    claimCode: USER_CLAIM_CODES[1],
  },
  {
    email: "user3.demo@example.com",
    password: DEMO_PASSWORD,
    firstName: "Demo",
    lastName: "User Three",
    customerType: "INDIVIDUAL",
    claimCode: USER_CLAIM_CODES[2],
  },
];

const UTILITY_DEFINITIONS = [
  { type: "ELECTRICITY", label: "Electricity", unit: "kWh", tariff: 0.25, cluster: [0, 0] },
  { type: "GAS", label: "Gas", unit: "m3", tariff: 0.18, cluster: [0.0048, 0.004] },
  { type: "WATER", label: "Water", unit: "m3", tariff: 0.008, cluster: [-0.0045, 0.0045] },
  { type: "HEATING", label: "Heating", unit: "kWh", tariff: 0.16, cluster: [0.0045, -0.0045] },
  { type: "COOLING", label: "Cooling", unit: "kWh", tariff: 0.14, cluster: [-0.0048, -0.004] },
];

const DEVICE_PROFILE_NAMES = {
  ELECTRICITY: "WattWise_Electricity_Meter",
  GAS: "WattWise_Gas_Meter",
  WATER: "WattWise_Water_Meter",
  HEATING: "WattWise_Heating_Meter",
  COOLING: "WattWise_Cooling_Meter",
};

const CODEC_FIELDS = {
  ELECTRICITY: {
    prefix: "E",
    script: `
      var total = readNumber(parts, 1);
      var voltage = readNumber(parts, 2);
      var current = readNumber(parts, 3);
      var powerKw = voltage * current / 1000;
      return {
        data: {
          utilityType: "ELECTRICITY",
          consumption: total,
          consum_total_kWh: total,
          voltage: voltage,
          current: current,
          power_kw: powerKw
        }
      };
    `,
    measurements: {
      consumption: { kind: "COUNTER", name: "Consumption" },
      voltage: { kind: "GAUGE", name: "Voltage" },
      current: { kind: "GAUGE", name: "Current" },
      power_kw: { kind: "GAUGE", name: "Load" },
    },
  },
  GAS: {
    prefix: "G",
    script: `
      var total = readNumber(parts, 1);
      var flow = readNumber(parts, 2);
      return {
        data: {
          utilityType: "GAS",
          consumption: total,
          gas_volume_m3: total,
          flow_m3_h: flow
        }
      };
    `,
    measurements: {
      consumption: { kind: "COUNTER", name: "Gas volume" },
      flow_m3_h: { kind: "GAUGE", name: "Flow rate" },
    },
  },
  WATER: {
    prefix: "W",
    script: `
      var total = readNumber(parts, 1);
      var flow = readNumber(parts, 2);
      return {
        data: {
          utilityType: "WATER",
          consumption: total,
          water_volume_m3: total,
          flow_m3_h: flow
        }
      };
    `,
    measurements: {
      consumption: { kind: "COUNTER", name: "Water volume" },
      flow_m3_h: { kind: "GAUGE", name: "Flow rate" },
    },
  },
  HEATING: {
    prefix: "H",
    script: `
      var total = readNumber(parts, 1);
      var thermalPower = readNumber(parts, 2);
      return {
        data: {
          utilityType: "HEATING",
          consumption: total,
          thermal_energy_kwh: total,
          thermal_power_kw: thermalPower
        }
      };
    `,
    measurements: {
      consumption: { kind: "COUNTER", name: "Thermal energy" },
      thermal_power_kw: { kind: "GAUGE", name: "Thermal rate" },
    },
  },
  COOLING: {
    prefix: "C",
    script: `
      var total = readNumber(parts, 1);
      var coolingPower = readNumber(parts, 2);
      return {
        data: {
          utilityType: "COOLING",
          consumption: total,
          cooling_energy_kwh: total,
          cooling_power_kw: coolingPower
        }
      };
    `,
    measurements: {
      consumption: { kind: "COUNTER", name: "Cooling energy" },
      cooling_power_kw: { kind: "GAUGE", name: "Cooling rate" },
    },
  },
};

function buildAsciiCodec(utilityType) {
  const definition = CODEC_FIELDS[utilityType];

  return `function decodeUplink(input) {
  function bytesToString(bytes) {
    var text = "";
    for (var i = 0; i < bytes.length; i++) {
      text += String.fromCharCode(bytes[i]);
    }
    return text;
  }

  function readNumber(parts, index) {
    var value = parseFloat(parts[index]);
    if (isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return value;
  }

  var payload = bytesToString(input.bytes);
  var parts = payload.split(",");
  if (parts[0] !== "${definition.prefix}") {
    return {
      errors: ["Invalid payload prefix for ${utilityType}: " + payload],
      data: {}
    };
  }

${definition.script}
}`;
}

function required(value, label) {
  if (!value) {
    throw new Error(`${label} is not configured.`);
  }

  return value;
}

function hashHex(seed, length) {
  return createHash("sha256").update(seed).digest("hex").slice(0, length);
}

function hashClaimCode(claimCode) {
  return createHash("sha256").update(claimCode.trim().toUpperCase()).digest("hex");
}

function resolveCoordinates(baseLatitude, baseLongitude, utilityDefinition, index) {
  const row = Math.floor(index / 5);
  const col = index % 5;
  const [clusterLat, clusterLng] = utilityDefinition.cluster;
  const localLat = (row - 0.5) * 0.0015;
  const localLng = (col - 2) * 0.0012;

  return {
    latitude: Number((baseLatitude + clusterLat + localLat).toFixed(7)),
    longitude: Number((baseLongitude + clusterLng + localLng).toFixed(7)),
  };
}

async function fetchSimulatorDevices() {
  const response = await fetch(`${SIMULATOR_API_URL}/api/devices`);
  if (!response.ok) {
    throw new Error(`LWN Simulator returned ${response.status} while listing devices.`);
  }

  const devices = await response.json();
  if (devices === null) {
    return [];
  }
  if (!Array.isArray(devices)) {
    throw new Error("LWN Simulator /api/devices did not return an array.");
  }

  return devices;
}

async function fetchSimulatorGateways() {
  const response = await fetch(`${SIMULATOR_API_URL}/api/gateways`);
  if (!response.ok) {
    throw new Error(`LWN Simulator returned ${response.status} while listing gateways.`);
  }

  const gateways = await response.json();
  if (gateways === null) {
    return [];
  }
  if (!Array.isArray(gateways)) {
    throw new Error("LWN Simulator /api/gateways did not return an array.");
  }

  return gateways;
}

async function fetchSimulatorStatus() {
  const response = await fetch(`${SIMULATOR_API_URL}/api/status`);
  if (!response.ok) {
    throw new Error(`LWN Simulator returned ${response.status} while reading status.`);
  }

  return Boolean(await response.json());
}

async function setSimulatorRunning(shouldRun) {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), SIMULATOR_CONTROL_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${SIMULATOR_API_URL}/api/${shouldRun ? "start" : "stop"}`, {
      signal: abortController.signal,
    });
  } catch (error) {
    if (!shouldRun && error instanceof Error && error.name === "AbortError") {
      const isRunning = await fetchSimulatorStatus();
      if (!isRunning) {
        return true;
      }
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to ${shouldRun ? "start" : "stop"} LWN Simulator: ${response.status} ${text}`);
  }

  return Boolean(await response.json());
}

async function ensureSimulatorBridgeAddress() {
  const response = await fetch(`${SIMULATOR_API_URL}/api/bridge/save`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ip: SIMULATOR_BRIDGE_ADDRESS,
      port: SIMULATOR_BRIDGE_PORT,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to configure LWN Simulator bridge address: ${response.status} ${text}`);
  }
}

function buildDefaultGateway(id, latitude, longitude) {
  return {
    id,
    info: {
      active: true,
      typeGateway: false,
      name: DEFAULT_GATEWAY_NAME,
      macAddress: DEFAULT_GATEWAY_MAC,
      location: {
        latitude,
        longitude,
        altitude: 0,
      },
      keepAlive: 10,
      ip: "",
      port: "",
    },
    stat: {},
  };
}

async function ensureSimulatorGateway(gateways, latitude, longitude) {
  const hasGateway = gateways.some(
    (gateway) => gateway?.info?.macAddress?.toLowerCase() === DEFAULT_GATEWAY_MAC,
  );
  if (hasGateway) {
    return 0;
  }

  const nextGatewayId =
    gateways.reduce((maxId, gateway) => Math.max(maxId, Number(gateway.id) || 0), 0) + 1;
  const response = await fetch(`${SIMULATOR_API_URL}/api/add-gateway`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(buildDefaultGateway(nextGatewayId, latitude, longitude)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to add default LWN Simulator gateway: ${response.status} ${text}`);
  }

  const result = await response.json();
  if (result?.code !== 0) {
    throw new Error(`LWN Simulator rejected default gateway: ${JSON.stringify(result)}`);
  }

  return 1;
}

async function ensureChirpStackGateway(chirpStackPool, tenantId, latitude, longitude) {
  await chirpStackPool.query(
    `
      INSERT INTO gateway (
        gateway_id, tenant_id, created_at, updated_at, last_seen_at, name, description,
        latitude, longitude, altitude, stats_interval_secs, tls_certificate, tags, properties
      )
      VALUES (
        decode($1, 'hex'), $2::uuid, NOW(), NOW(), NULL, $3, $4,
        $5, $6, 0, 30, NULL, $7::jsonb, $8::jsonb
      )
      ON CONFLICT (gateway_id)
      DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        updated_at = NOW(),
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        altitude = EXCLUDED.altitude,
        stats_interval_secs = EXCLUDED.stats_interval_secs,
        tags = EXCLUDED.tags,
        properties = EXCLUDED.properties
    `,
    [
      DEFAULT_GATEWAY_MAC,
      tenantId,
      DEFAULT_GATEWAY_NAME,
      "Gateway provisioned for the WattWise thesis demo and used by LWN Simulator.",
      latitude,
      longitude,
      JSON.stringify({ app: "wattwise", demoFleet: "true" }),
      JSON.stringify({ region_config_id: "eu868", region_common_name: "EU868" }),
    ],
  );
}

function buildDefaultLwnTemplate(latitude, longitude) {
  return {
    info: {
      status: {
        mtype: "UnConfirmedDataUp",
        payload: "",
        active: true,
        infoUplink: {
          fport: 2,
          fcnt: 0,
        },
        fcntDown: 0,
        base64: false,
      },
      configuration: {
        region: 1,
        sendInterval: 10,
        ackTimeout: 2,
        range: 10000,
        disableFCntDown: false,
        supportedOtaa: true,
        supportedADR: true,
        supportedFragment: false,
        supportedClassB: false,
        supportedClassC: false,
        dataRate: 5,
        rx1DROffset: 0,
        nbRetransmission: 1,
      },
      location: {
        latitude,
        longitude,
        altitude: 0,
      },
      rxs: DEFAULT_LWN_RXS,
    },
  };
}

function buildLwnDevice({ id, template, device }) {
  const templateInfo = template?.info ?? {};
  const templateStatus = templateInfo.status ?? {};
  const templateConfiguration = templateInfo.configuration ?? {};
  const templateRxs = templateInfo.rxs ?? [];

  return {
    id,
    info: {
      devEUI: device.devEui,
      devAddr: device.devAddr,
      nwkSKey: device.nwkSKey,
      appSKey: device.appSKey,
      appKey: device.appKey,
      name: device.name,
      status: {
        ...templateStatus,
        mtype: templateStatus.mtype ?? "UnConfirmedDataUp",
        payload: device.payload,
        active: true,
        infoUplink: {
          fport: templateStatus.infoUplink?.fport ?? 2,
          fcnt: 0,
        },
        fcntDown: 0,
        base64: false,
      },
      configuration: {
        ...templateConfiguration,
        region: templateConfiguration.region ?? 1,
        sendInterval: templateConfiguration.sendInterval ?? 10,
        supportedOtaa: true,
      },
      location: {
        latitude: device.latitude,
        longitude: device.longitude,
        altitude: 0,
      },
      rxs: templateRxs,
    },
  };
}

async function postSimulatorDevice(deviceBody) {
  const response = await fetch(`${SIMULATOR_API_URL}/api/add-device`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(deviceBody),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to add ${deviceBody.info.devEUI} to LWN Simulator: ${response.status} ${text}`);
  }

  const result = await response.json();
  if (result?.code !== 0) {
    throw new Error(`LWN Simulator rejected ${deviceBody.info.devEUI}: ${JSON.stringify(result)}`);
  }
}

async function updateSimulatorDevice(deviceBody) {
  const response = await fetch(`${SIMULATOR_API_URL}/api/up-device`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(deviceBody),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update ${deviceBody.info.devEUI} in LWN Simulator: ${response.status} ${text}`);
  }

  const result = await response.json();
  if (result?.code !== 0) {
    throw new Error(`LWN Simulator rejected update for ${deviceBody.info.devEUI}: ${JSON.stringify(result)}`);
  }
}

async function ensureChirpStackDeviceProfile(chirpStackPool, baseProfileId, utilityType) {
  const profileName = DEVICE_PROFILE_NAMES[utilityType];
  const codecScript = buildAsciiCodec(utilityType);
  const measurements = JSON.stringify(CODEC_FIELDS[utilityType].measurements);

  const existingResult = await chirpStackPool.query(
    "SELECT id FROM device_profile WHERE name = $1 ORDER BY created_at DESC LIMIT 1",
    [profileName],
  );

  const existingId = existingResult.rows[0]?.id;
  if (existingId) {
    await chirpStackPool.query(
      `
        UPDATE device_profile
        SET
          updated_at = NOW(),
          payload_codec_runtime = 'JS',
          payload_codec_script = $2,
          measurements = $3::jsonb,
          auto_detect_measurements = false,
          description = $4
        WHERE id = $1::uuid
      `,
      [
        existingId,
        codecScript,
        measurements,
        `${utilityType} meter profile used by the WattWise thesis demo.`,
      ],
    );

    return existingId;
  }

  const newId = randomUUID();
  await chirpStackPool.query(
    `
      INSERT INTO device_profile (
        id, tenant_id, created_at, updated_at, name, region, mac_version, reg_params_revision,
        adr_algorithm_id, payload_codec_runtime, uplink_interval, device_status_req_interval,
        supports_otaa, supports_class_b, supports_class_c, tags, payload_codec_script,
        flush_queue_on_activate, description, measurements, auto_detect_measurements,
        region_config_id, allow_roaming, rx1_delay, abp_params, class_b_params, class_c_params,
        relay_params, app_layer_params, device_id, firmware_version, vendor_profile_id,
        supported_uplink_data_rates
      )
      SELECT
        $1::uuid, tenant_id, NOW(), NOW(), $2, region, mac_version, reg_params_revision,
        adr_algorithm_id, 'JS', uplink_interval, device_status_req_interval,
        supports_otaa, supports_class_b, supports_class_c, tags, $3,
        flush_queue_on_activate, $4, $5::jsonb, false,
        region_config_id, allow_roaming, rx1_delay, abp_params, class_b_params, class_c_params,
        relay_params, app_layer_params, device_id, firmware_version, vendor_profile_id,
        supported_uplink_data_rates
      FROM device_profile
      WHERE id = $6::uuid
    `,
    [
      newId,
      profileName,
      codecScript,
      `${utilityType} meter profile used by the WattWise thesis demo.`,
      measurements,
      baseProfileId,
    ],
  );

  return newId;
}

async function ensureChirpStackDeviceProfiles(chirpStackPool, baseProfileId) {
  const profileIdsByUtility = {};

  for (const utilityDefinition of UTILITY_DEFINITIONS) {
    profileIdsByUtility[utilityDefinition.type] = await ensureChirpStackDeviceProfile(
      chirpStackPool,
      baseProfileId,
      utilityDefinition.type,
    );
  }

  return profileIdsByUtility;
}

async function resolveChirpStackTargets(chirpStackPool) {
  const applicationName = process.env.CHIRPSTACK_APPLICATION_NAME ?? "Monitorizare_Energie";
  const profileName = process.env.CHIRPSTACK_DEVICE_PROFILE_NAME ?? "Profil_SmartMeter";

  const applicationResult = await chirpStackPool.query(
    "SELECT id, tenant_id FROM application WHERE name = $1 ORDER BY created_at DESC LIMIT 1",
    [applicationName],
  );
  const profileResult = await chirpStackPool.query(
    "SELECT id FROM device_profile WHERE name = $1 ORDER BY created_at DESC LIMIT 1",
    [profileName],
  );

  const applicationId = applicationResult.rows[0]?.id;
  const tenantId = applicationResult.rows[0]?.tenant_id;
  const baseDeviceProfileId = profileResult.rows[0]?.id;

  if (!applicationId || !tenantId || !baseDeviceProfileId) {
    throw new Error(`Could not find ChirpStack application "${applicationName}" and profile "${profileName}".`);
  }

  const profileIdsByUtility = await ensureChirpStackDeviceProfiles(chirpStackPool, baseDeviceProfileId);

  return { applicationId, tenantId, baseDeviceProfileId, profileIdsByUtility };
}

async function upsertDemoUser(appPool, demoUser) {
  const passwordHash = await bcrypt.hash(demoUser.password, 12);
  const result = await appPool.query(
    `
      INSERT INTO "User" (
        id, email, "passwordHash", "firstName", "lastName", role, "customerType", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, 'CUSTOMER', $6::"CustomerType", NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        "passwordHash" = EXCLUDED."passwordHash",
        "firstName" = EXCLUDED."firstName",
        "lastName" = EXCLUDED."lastName",
        role = 'CUSTOMER',
        "customerType" = EXCLUDED."customerType",
        "updatedAt" = NOW()
      RETURNING id, email
    `,
    [
      randomUUID(),
      demoUser.email,
      passwordHash,
      demoUser.firstName,
      demoUser.lastName,
      demoUser.customerType,
    ],
  );

  return result.rows[0];
}

function buildDemoDevices(baseLatitude, baseLongitude) {
  const devices = [];

  for (const utilityDefinition of UTILITY_DEFINITIONS) {
    for (let index = 0; index < 10; index += 1) {
      const ordinal = index + 1;
      const companyOwned = index < 7;
      const userIndex = companyOwned ? null : index - 7;
      const owner = companyOwned ? DEMO_USERS[0] : DEMO_USERS[userIndex + 1];
      const claimCode = companyOwned ? COMPANY_CLAIM_CODE : USER_CLAIM_CODES[userIndex];
      const coordinates = resolveCoordinates(baseLatitude, baseLongitude, utilityDefinition, index);
      const seed = `${utilityDefinition.type}:${ordinal}`;
      const devEui = hashHex(`dev-eui:${seed}`, 16);

      devices.push({
        devEui,
        devAddr: hashHex(`dev-addr:${seed}`, 8),
        nwkSKey: hashHex(`nwk-s-key:${seed}`, 32),
        appSKey: hashHex(`app-s-key:${seed}`, 32),
        appKey: hashHex(`app-key:${seed}`, 32),
        name: `${utilityDefinition.label} Meter ${String(ordinal).padStart(2, "0")}`,
        utilityType: utilityDefinition.type,
        unitLabel: utilityDefinition.unit,
        tariffPerUnit: utilityDefinition.tariff,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        ownerEmail: owner.email,
        ownerCustomerType: owner.customerType,
        claimCode,
        claimCodeHash: hashClaimCode(claimCode),
        claimCodeLabel: companyOwned ? "Company demo fleet" : `${owner.firstName} ${owner.lastName}`,
      });
      devices[devices.length - 1].payload = encodeSmartMeterPayload(devices[devices.length - 1]);
    }
  }

  return devices;
}

async function upsertChirpStackDevice(chirpStackPool, targets, device) {
  const deviceProfileId = targets.profileIdsByUtility[device.utilityType] ?? targets.baseDeviceProfileId;
  const tags = {
    app: "wattwise",
    demoFleet: "true",
    utilityType: device.utilityType,
    unitLabel: device.unitLabel,
  };
  const variables = {
    appOwnerEmail: device.ownerEmail,
    claimCodeHash: device.claimCodeHash,
    claimCodeLabel: device.claimCodeLabel,
    claimCodeCustomerType: device.ownerCustomerType,
    tariffPerUnit: String(device.tariffPerUnit),
    utilityType: device.utilityType,
    unitLabel: device.unitLabel,
  };

  await chirpStackPool.query(
    `
      INSERT INTO device (
        dev_eui, application_id, device_profile_id, created_at, updated_at, name, description,
        external_power_source, latitude, longitude, altitude, enabled_class, skip_fcnt_check,
        is_disabled, tags, variables, join_eui, app_layer_params, f_cnt_up
      )
      VALUES (
        decode($1, 'hex'), $2::uuid, $3::uuid, NOW(), NOW(), $4, $5,
        true, $6, $7, 0, 'A', false, false, $8::jsonb, $9::jsonb,
        decode('0000000000000000', 'hex'), '{}'::jsonb, 0
      )
      ON CONFLICT (dev_eui)
      DO UPDATE SET
        application_id = EXCLUDED.application_id,
        device_profile_id = EXCLUDED.device_profile_id,
        updated_at = NOW(),
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        external_power_source = EXCLUDED.external_power_source,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        altitude = EXCLUDED.altitude,
        enabled_class = EXCLUDED.enabled_class,
        skip_fcnt_check = EXCLUDED.skip_fcnt_check,
        is_disabled = EXCLUDED.is_disabled,
        tags = EXCLUDED.tags,
        variables = EXCLUDED.variables,
        join_eui = EXCLUDED.join_eui,
        app_layer_params = EXCLUDED.app_layer_params
    `,
    [
      device.devEui,
      targets.applicationId,
      deviceProfileId,
      device.name,
      `${device.utilityType} smart meter provisioned for the WattWise thesis demo.`,
      device.latitude,
      device.longitude,
      JSON.stringify(tags),
      JSON.stringify(variables),
    ],
  );

  await chirpStackPool.query(
    `
      INSERT INTO device_keys (
        dev_eui, created_at, updated_at, nwk_key, app_key, dev_nonces, join_nonce, gen_app_key
      )
      VALUES (
        decode($1, 'hex'), NOW(), NOW(), decode($2, 'hex'), decode($2, 'hex'),
        '{"0000000000000000":[]}'::jsonb, 0,
        decode('00000000000000000000000000000000', 'hex')
      )
      ON CONFLICT (dev_eui)
      DO UPDATE SET
        updated_at = NOW(),
        nwk_key = EXCLUDED.nwk_key,
        app_key = EXCLUDED.app_key,
        dev_nonces = CASE
          WHEN jsonb_typeof(device_keys.dev_nonces) = 'array' THEN EXCLUDED.dev_nonces
          ELSE device_keys.dev_nonces
        END
    `,
    [device.devEui, device.appKey],
  );
}

async function upsertAppDevice(appPool, device, ownerByEmail) {
  const owner = ownerByEmail.get(device.ownerEmail);
  if (!owner) {
    throw new Error(`Missing app owner ${device.ownerEmail} for ${device.devEui}.`);
  }

  await appPool.query(
    `
      INSERT INTO "Device" (
        id, "devEui", name, "utilityType", "tariffPerUnit", "unitLabel", "isActive",
        latitude, longitude, "userId", "claimCodeHash", "claimCodeLabel",
        "claimCodeCustomerType", "claimedAt", "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4::"UtilityType", $5, $6, true, $7, $8, $9, $10, $11, $12::"CustomerType",
        NOW(), NOW(), NOW()
      )
      ON CONFLICT ("devEui")
      DO UPDATE SET
        name = EXCLUDED.name,
        "utilityType" = EXCLUDED."utilityType",
        "tariffPerUnit" = EXCLUDED."tariffPerUnit",
        "unitLabel" = EXCLUDED."unitLabel",
        "isActive" = EXCLUDED."isActive",
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        "userId" = EXCLUDED."userId",
        "claimCodeHash" = EXCLUDED."claimCodeHash",
        "claimCodeLabel" = EXCLUDED."claimCodeLabel",
        "claimCodeCustomerType" = EXCLUDED."claimCodeCustomerType",
        "claimedAt" = COALESCE("Device"."claimedAt", NOW()),
        "updatedAt" = NOW()
    `,
    [
      randomUUID(),
      device.devEui,
      device.name,
      device.utilityType,
      device.tariffPerUnit,
      device.unitLabel,
      device.latitude,
      device.longitude,
      owner.id,
      device.claimCodeHash,
      device.claimCodeLabel,
      device.ownerCustomerType,
    ],
  );
}

async function main() {
  required(APP_DATABASE_URL, "DATABASE_URL");

  const appPool = new Pool({ connectionString: APP_DATABASE_URL });
  const chirpStackPool = new Pool({ connectionString: CHIRPSTACK_DATABASE_URL });
  let shouldRestartSimulator = false;

  try {
    const simulatorDevices = await fetchSimulatorDevices();
    const simulatorGateways = await fetchSimulatorGateways();
    const template = simulatorDevices[0] ?? buildDefaultLwnTemplate(DEFAULT_BASE_LATITUDE, DEFAULT_BASE_LONGITUDE);
    const templateLocation = template?.info?.location ?? {};
    const baseLatitude = Number(templateLocation.latitude ?? DEFAULT_BASE_LATITUDE);
    const baseLongitude = Number(templateLocation.longitude ?? DEFAULT_BASE_LONGITUDE);
    await ensureSimulatorBridgeAddress();
    const gatewaysCreated = await ensureSimulatorGateway(simulatorGateways, baseLatitude, baseLongitude);
    const simulatorWasRunning = await fetchSimulatorStatus();
    if (simulatorWasRunning) {
      await setSimulatorRunning(false);
      shouldRestartSimulator = true;
    }

    const nextLwnId =
      simulatorDevices.reduce((maxId, device) => Math.max(maxId, Number(device.id) || 0), 0) + 1;
    const existingSimulatorDeviceByDevEui = new Map(
      simulatorDevices
        .filter((device) => typeof device?.info?.devEUI === "string")
        .map((device) => [device.info.devEUI.toLowerCase(), device]),
    );

    const targets = await resolveChirpStackTargets(chirpStackPool);
    await ensureChirpStackGateway(chirpStackPool, targets.tenantId, baseLatitude, baseLongitude);

    const ownerByEmail = new Map();
    for (const demoUser of DEMO_USERS) {
      const user = await upsertDemoUser(appPool, demoUser);
      ownerByEmail.set(user.email.toLowerCase(), user);
    }

    const demoDevices = buildDemoDevices(baseLatitude, baseLongitude);
    let lwnCreated = 0;
    let lwnUpdated = 0;

    for (const device of demoDevices) {
      const existingSimulatorDevice = existingSimulatorDeviceByDevEui.get(device.devEui.toLowerCase());
      if (existingSimulatorDevice) {
        const lwnDevice = buildLwnDevice({
          id: Number(existingSimulatorDevice.id),
          template,
          device,
        });
        await updateSimulatorDevice(lwnDevice);
        lwnUpdated += 1;
      } else {
        const lwnDevice = buildLwnDevice({
          id: nextLwnId + lwnCreated,
          template,
          device,
        });
        await postSimulatorDevice(lwnDevice);
        lwnCreated += 1;
      }

      await upsertChirpStackDevice(chirpStackPool, targets, device);
      await upsertAppDevice(appPool, device, ownerByEmail);
    }

    console.log(`Provisioned ${demoDevices.length} demo devices.`);
    console.log(`Added ${gatewaysCreated} default gateway to LWN Simulator.`);
    console.log(`Ensured ChirpStack gateway ${DEFAULT_GATEWAY_MAC} (${DEFAULT_GATEWAY_NAME}).`);
    console.log(`Added ${lwnCreated} new devices to LWN Simulator; updated ${lwnUpdated} existing devices.`);
    console.log("Demo accounts:");
    console.log(`- company.demo@example.com / ${DEMO_PASSWORD} / ${COMPANY_CLAIM_CODE}`);
    console.log(`- user1.demo@example.com / ${DEMO_PASSWORD} / ${USER_CLAIM_CODES[0]}`);
    console.log(`- user2.demo@example.com / ${DEMO_PASSWORD} / ${USER_CLAIM_CODES[1]}`);
    console.log(`- user3.demo@example.com / ${DEMO_PASSWORD} / ${USER_CLAIM_CODES[2]}`);
  } finally {
    if (shouldRestartSimulator) {
      await setSimulatorRunning(true).catch((error) => {
        console.error("Failed to restart LWN Simulator after provisioning:", error);
      });
    }
    await appPool.end();
    await chirpStackPool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
