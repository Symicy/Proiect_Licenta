import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useDeviceSse } from "@/lib/hooks/useDeviceSse";
import type { MeterReading } from "@/lib/services/influx.service";
import { defaultUnitLabelForUtilityType, type UtilityType } from "@/lib/utility";

import { NAV_ITEMS, VIEW_PATHS } from "../constants";
import { LANGUAGE_STORAGE_KEY, type DashboardLanguage } from "../i18n";
import type {
  AlertItem,
  AuthFormState,
  AuthMode,
  AuthResponse,
  ClaimDevicesResponse,
  CostResponse,
  CreateDeviceFormState,
  DeviceCostResult,
  DeviceRow,
  DevicesResponse,
  FleetSummary,
  FleetSummaryResponse,
  ForecastResponse,
  LatestReadingResponse,
  MeResponse,
  PublicDevice,
  PublicUser,
  RangeReadingsResponse,
  StatusFilter,
  UpdateDeviceFormState,
  ViewKey,
} from "../types";
import {
  apiRequest,
  buildChartPaths,
  buildTimelineLabels,
  extractErrorMessage,
  formatRelativeTime,
  rangeStart,
  resolveDeviceStatus,
} from "../utils";

type DashboardSessionCache = {
  bootResolved: boolean;
  user: PublicUser | null;
  devicesResolved: boolean;
  devices: PublicDevice[];
  selectedDevEui: string | null;
};

const dashboardSessionCache: DashboardSessionCache = {
  bootResolved: false,
  user: null,
  devicesResolved: false,
  devices: [],
  selectedDevEui: null,
};

function normalizePathname(pathname: string | null) {
  if (!pathname) {
    return null;
  }

  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function resolveViewFromPath(pathname: string | null): ViewKey | null {
  const normalizedPathname = normalizePathname(pathname);
  const matchedEntry = (Object.entries(VIEW_PATHS) as Array<[ViewKey, string]>).find(
    ([, path]) => path === normalizedPathname,
  );

  return matchedEntry?.[0] ?? null;
}

function hasValidCoordinates(device: PublicDevice): device is PublicDevice & { latitude: number; longitude: number } {
  return (
    typeof device.latitude === "number" &&
    Number.isFinite(device.latitude) &&
    device.latitude >= -90 &&
    device.latitude <= 90 &&
    typeof device.longitude === "number" &&
    Number.isFinite(device.longitude) &&
    device.longitude >= -180 &&
    device.longitude <= 180
  );
}

function toCoordinateFormValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function parseCoordinateInput(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : Number(trimmed);
}

function parseUnitLabelInput(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function useDashboardController(initialView: ViewKey = "overview") {
  const router = useRouter();
  const pathname = usePathname();
  const initialRouteView = resolveViewFromPath(pathname) ?? initialView;

  const [bootLoading, setBootLoading] = useState(!dashboardSessionCache.bootResolved);
  const [language, setLanguage] = useState<DashboardLanguage>("en");
  const [languageHydrated, setLanguageHydrated] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(dashboardSessionCache.user);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState<AuthFormState>({
    firstName: "",
    lastName: "",
    customerType: "INDIVIDUAL",
    claimCode: "",
    email: "",
    password: "",
  });

  const [activeView, setActiveView] = useState<ViewKey>(initialRouteView);
  const [devices, setDevices] = useState<PublicDevice[]>(dashboardSessionCache.devices);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [selectedDevEui, setSelectedDevEui] = useState<string | null>(dashboardSessionCache.selectedDevEui);
  const [claimCode, setClaimCode] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [showCreateDevice, setShowCreateDevice] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateDeviceFormState>({
    devEui: "",
    name: "",
    utilityType: "ELECTRICITY",
    tariffPerUnit: "0.25",
    unitLabel: defaultUnitLabelForUtilityType("ELECTRICITY"),
    isActive: true,
    latitude: "",
    longitude: "",
  });
  const [editingDevEui, setEditingDevEui] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateDeviceFormState>({
    name: "",
    utilityType: "ELECTRICITY",
    tariffPerUnit: "0.25",
    unitLabel: defaultUnitLabelForUtilityType("ELECTRICITY"),
    isActive: true,
    latitude: "",
    longitude: "",
  });

  const [selectedReadings, setSelectedReadings] = useState<MeterReading[]>([]);
  const [selectedLatest, setSelectedLatest] = useState<MeterReading | null>(null);
  const [selectedCosts, setSelectedCosts] = useState<{
    today: DeviceCostResult | null;
    week: DeviceCostResult | null;
    month: DeviceCostResult | null;
  }>({
    today: null,
    week: null,
    month: null,
  });
  const [selectedForecast, setSelectedForecast] = useState<ForecastResponse | null>(null);
  const [selectedForecastError, setSelectedForecastError] = useState<string | null>(null);
  const [selectedDataLoading, setSelectedDataLoading] = useState(false);
  const [selectedDataError, setSelectedDataError] = useState<string | null>(null);
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [fleetSummaryLoading, setFleetSummaryLoading] = useState(false);
  const [fleetSummaryError, setFleetSummaryError] = useState<string | null>(null);

  const {
    status: streamStatus,
    errorMessage: streamError,
    lastHeartbeatAt,
    connectionInfo,
    latestByDevice,
  } = useDeviceSse({
    enabled: Boolean(user),
    pollMs: 3000,
  });

  useEffect(() => {
    const routeView = resolveViewFromPath(pathname);
    if (!routeView) {
      return;
    }

    setActiveView((current) => (current === routeView ? current : routeView));
  }, [pathname]);

  const setActiveViewWithRoute = useCallback(
    (nextView: ViewKey) => {
      setActiveView(nextView);
      const nextPath = VIEW_PATHS[nextView];
      if (pathname !== nextPath) {
        router.push(nextPath, { scroll: false });
      }
    },
    [pathname, router],
  );

  const selectedDevice = useMemo(
    () => devices.find((device) => device.devEui === selectedDevEui) ?? null,
    [devices, selectedDevEui],
  );
  const devicesWithCoordinates = useMemo(
    () => devices.filter(hasValidCoordinates),
    [devices],
  );

  useEffect(() => {
    if (!editingDevEui) {
      return;
    }

    if (!devices.some((device) => device.devEui === editingDevEui)) {
      setEditingDevEui(null);
      setEditError(null);
    }
  }, [devices, editingDevEui]);

  const loadDevices = useCallback(async () => {
    setDevicesLoading(true);
    setDevicesError(null);

    try {
      const payload = await apiRequest<DevicesResponse>("/api/devices");
      dashboardSessionCache.devices = payload.devices;
      dashboardSessionCache.devicesResolved = true;

      setDevices(payload.devices);
      setSelectedDevEui((current) => {
        const nextSelection =
          current && payload.devices.some((device) => device.devEui === current)
            ? current
            : payload.devices[0]?.devEui ?? null;

        dashboardSessionCache.selectedDevEui = nextSelection;

        return nextSelection;
      });
    } catch (error) {
      setDevicesError(extractErrorMessage(error));
      setDevices([]);
      setSelectedDevEui(null);

      dashboardSessionCache.devicesResolved = false;
      dashboardSessionCache.devices = [];
      dashboardSessionCache.selectedDevEui = null;
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const loadFleetSummary = useCallback(async () => {
    setFleetSummaryLoading(true);
    setFleetSummaryError(null);

    try {
      const payload = await apiRequest<FleetSummaryResponse>("/api/devices/summary");
      setFleetSummary(payload.summary);
    } catch (error) {
      setFleetSummary(null);
      setFleetSummaryError(extractErrorMessage(error));
    } finally {
      setFleetSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    dashboardSessionCache.user = user;
  }, [user]);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const nextLanguage = storedLanguage === "ro" ? "ro" : "en";
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
    setLanguageHydrated(true);
  }, []);

  useEffect(() => {
    if (!languageHydrated) {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language, languageHydrated]);

  useEffect(() => {
    dashboardSessionCache.devices = devices;
  }, [devices]);

  useEffect(() => {
    dashboardSessionCache.selectedDevEui = selectedDevEui;
  }, [selectedDevEui]);

  useEffect(() => {
    let cancelled = false;

    if (dashboardSessionCache.bootResolved) {
      setBootLoading(false);

      const revalidateSession = async () => {
        try {
          const payload = await apiRequest<MeResponse>("/api/auth/me");
          if (!cancelled) {
            setUser(payload.user);
          }
        } catch {
          if (!cancelled) {
            setUser(null);
          }
        }
      };

      void revalidateSession();

      return () => {
        cancelled = true;
      };
    }

    const bootstrap = async () => {
      try {
        const payload = await apiRequest<MeResponse>("/api/auth/me");
        if (!cancelled) {
          setUser(payload.user);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setBootLoading(false);
          dashboardSessionCache.bootResolved = true;
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadSelectedDeviceData = useCallback(async (devEui: string) => {
    setSelectedDataLoading(true);
    setSelectedDataError(null);

    try {
      const stop = new Date().toISOString();

      const forecastRequest = apiRequest<ForecastResponse>(
        `/api/devices/${devEui}/forecast?lookbackHours=${24 * 30}&horizonHours=24&stepHours=3`,
      )
        .then((payload) => ({ payload, error: null as string | null }))
        .catch((error) => ({ payload: null, error: extractErrorMessage(error) }));

      const [latestPayload, readingsPayload, todayCostPayload, weekCostPayload, monthCostPayload, forecastResult] =
        await Promise.all([
          apiRequest<LatestReadingResponse>(`/api/devices/${devEui}/readings?mode=latest`),
          apiRequest<RangeReadingsResponse>(
            `/api/devices/${devEui}/readings?mode=range&limit=240&aggregateWindow=3h&aggregateFn=mean&start=${encodeURIComponent(
              rangeStart(24 * 30),
            )}&stop=${encodeURIComponent(stop)}`,
          ),
          apiRequest<CostResponse>(
            `/api/devices/${devEui}/cost?calculationMode=delta&start=${encodeURIComponent(
              rangeStart(24),
            )}&stop=${encodeURIComponent(stop)}`,
          ),
          apiRequest<CostResponse>(
            `/api/devices/${devEui}/cost?calculationMode=delta&start=${encodeURIComponent(
              rangeStart(24 * 7),
            )}&stop=${encodeURIComponent(stop)}`,
          ),
          apiRequest<CostResponse>(
            `/api/devices/${devEui}/cost?calculationMode=delta&start=${encodeURIComponent(
              rangeStart(24 * 30),
            )}&stop=${encodeURIComponent(stop)}`,
          ),
          forecastRequest,
        ]);

      setSelectedLatest(latestPayload.reading);
      setSelectedReadings(readingsPayload.readings);
      setSelectedCosts({
        today: todayCostPayload.cost,
        week: weekCostPayload.cost,
        month: monthCostPayload.cost,
      });
      setSelectedForecast(forecastResult.payload);
      setSelectedForecastError(forecastResult.error);
    } catch (error) {
      setSelectedDataError(extractErrorMessage(error));
      setSelectedLatest(null);
      setSelectedReadings([]);
      setSelectedForecast(null);
      setSelectedForecastError(null);
      setSelectedCosts({
        today: null,
        week: null,
        month: null,
      });
    } finally {
      setSelectedDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setDevices([]);
      setSelectedDevEui(null);
      setEditingDevEui(null);
      setEditError(null);
      setFleetSummary(null);
      setFleetSummaryError(null);

      dashboardSessionCache.devicesResolved = false;
      dashboardSessionCache.devices = [];
      dashboardSessionCache.selectedDevEui = null;
      return;
    }

    if (dashboardSessionCache.devicesResolved) {
      setDevices(dashboardSessionCache.devices);
      setSelectedDevEui((current) => current ?? dashboardSessionCache.selectedDevEui ?? dashboardSessionCache.devices[0]?.devEui ?? null);
      void loadFleetSummary();
      return;
    }

    void loadDevices();
    void loadFleetSummary();
  }, [user, loadDevices, loadFleetSummary]);

  useEffect(() => {
    if (!user || !selectedDevEui) {
      setSelectedLatest(null);
      setSelectedReadings([]);
      setSelectedCosts({
        today: null,
        week: null,
        month: null,
      });
      setSelectedForecast(null);
      setSelectedForecastError(null);
      return;
    }

    void loadSelectedDeviceData(selectedDevEui);
  }, [user, selectedDevEui, loadSelectedDeviceData]);

  useEffect(() => {
    if (!selectedDevEui) {
      return;
    }

    const streamPayload = latestByDevice[selectedDevEui];
    if (streamPayload) {
      setSelectedLatest(streamPayload.reading);
    }
  }, [latestByDevice, selectedDevEui]);

  const deviceRows = useMemo<DeviceRow[]>(() => {
    return devices.map((device) => {
      const streamPayload = latestByDevice[device.devEui];

      const reading = streamPayload?.reading ?? (selectedDevEui === device.devEui ? selectedLatest : null);
      const loadWatts =
        reading && reading.voltage !== null && reading.current !== null
          ? reading.voltage * reading.current
          : null;
      const latestConsumption = reading?.consumption ?? null;

      const status = resolveDeviceStatus(device, reading, streamStatus);

      return {
        device,
        reading,
        latestConsumption,
        loadWatts,
        status,
        lastSeen: formatRelativeTime(reading?.timestamp),
        liveCost: streamPayload?.estimatedCostAtReading ?? null,
      };
    });
  }, [devices, latestByDevice, selectedDevEui, selectedLatest, streamStatus]);

  const filteredDeviceRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return deviceRows.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        row.device.name.toLowerCase().includes(normalizedSearch) ||
        row.device.devEui.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [deviceRows, searchQuery, statusFilter]);

  const selectedDeviceRow = useMemo(
    () => deviceRows.find((row) => row.device.devEui === selectedDevEui) ?? null,
    [deviceRows, selectedDevEui],
  );

  const activeDeviceCount = useMemo(
    () => devices.filter((device) => device.isActive).length,
    [devices],
  );
  const connectedCount = useMemo(
    () => deviceRows.filter((row) => row.status === "connected").length,
    [deviceRows],
  );
  const heartbeatCount = useMemo(
    () => deviceRows.filter((row) => row.status === "heartbeat").length,
    [deviceRows],
  );
  const errorCount = useMemo(
    () => deviceRows.filter((row) => row.status === "error").length,
    [deviceRows],
  );
  const fleetHealthPercent =
    activeDeviceCount > 0 ? Math.round((connectedCount / activeDeviceCount) * 100) : 0;

  const topConsumers = useMemo(
    () =>
      [...deviceRows]
        .filter((row) => row.latestConsumption !== null)
        .sort((first, second) => (second.latestConsumption ?? 0) - (first.latestConsumption ?? 0))
        .slice(0, 4),
    [deviceRows],
  );

  const liveByCategory = useMemo(() => {
    const categories = new Map<
      string,
      {
        utilityType: PublicDevice["utilityType"];
        unitLabel: string;
        deviceCount: number;
        latestConsumption: number;
        liveEstimatedCost: number;
      }
    >();

    for (const row of deviceRows) {
      const key = `${row.device.utilityType}::${row.device.unitLabel}`;
      const existing = categories.get(key);

      if (!existing) {
        categories.set(key, {
          utilityType: row.device.utilityType,
          unitLabel: row.device.unitLabel,
          deviceCount: 1,
          latestConsumption: row.latestConsumption ?? 0,
          liveEstimatedCost: row.liveCost ?? 0,
        });
        continue;
      }

      existing.deviceCount += 1;
      existing.latestConsumption += row.latestConsumption ?? 0;
      existing.liveEstimatedCost += row.liveCost ?? 0;
    }

    return [...categories.values()].sort(
      (first, second) => second.liveEstimatedCost - first.liveEstimatedCost,
    );
  }, [deviceRows]);

  const chartSeries = useMemo(
    () => selectedReadings.map((reading) => reading.consumption),
    [selectedReadings],
  );
  const chartPaths = useMemo(() => buildChartPaths(chartSeries), [chartSeries]);
  const chartLabels = useMemo(() => buildTimelineLabels(selectedReadings), [selectedReadings]);

  const currentLoadWatts =
    selectedLatest && selectedLatest.voltage !== null && selectedLatest.current !== null
      ? selectedLatest.voltage * selectedLatest.current
      : null;
  const currentLoadKw = currentLoadWatts !== null ? currentLoadWatts / 1000 : null;
  const currentConsumption = selectedLatest?.consumption ?? null;

  const recentAlerts = useMemo<AlertItem[]>(() => {
    const alerts: AlertItem[] = [];

    if (streamError) {
      alerts.push({
        id: "stream-error",
        title: "Stream Error",
        body: streamError,
        level: "error",
      });
    }

    const errorRows = deviceRows.filter((row) => row.status === "error").slice(0, 3);
    for (const row of errorRows) {
      alerts.push({
        id: `${row.device.devEui}-error`,
        title: `Device Error: ${row.device.name}`,
        body: `${row.device.devEui} has stale telemetry (${row.lastSeen}).`,
        level: "error",
      });
    }

    if (alerts.length < 3 && heartbeatCount > 0) {
      alerts.push({
        id: "heartbeat-status",
        title: "Heartbeat Monitoring",
        body: `${heartbeatCount} device(s) are in delayed-heartbeat state.`,
        level: "info",
      });
    }

    if (alerts.length < 3 && connectionInfo) {
      alerts.push({
        id: "stream-connected",
        title: "Stream Connected",
        body: `Connection ${connectionInfo.connectionId} monitoring ${connectionInfo.deviceCount} device(s).`,
        level: "info",
      });
    }

    return alerts.slice(0, 3);
  }, [connectionInfo, deviceRows, heartbeatCount, streamError]);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setAuthSubmitting(true);
    setAuthError(null);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : {
              firstName: authForm.firstName,
              lastName: authForm.lastName,
              customerType: authForm.customerType,
              claimCode: authForm.claimCode,
              email: authForm.email,
              password: authForm.password,
            };

      const payload = await apiRequest<AuthResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setUser(payload.user);
      setActiveViewWithRoute("overview");
      setAuthForm((previous) => ({
        ...previous,
        password: "",
        claimCode: "",
      }));
    } catch (error) {
      setAuthError(extractErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setLogoutSubmitting(true);
    setLogoutError(null);

    try {
      await apiRequest<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setEditingDevEui(null);
      setEditError(null);
      setClaimCode("");
      setClaimError(null);
      setClaimSuccess(null);

      dashboardSessionCache.user = null;
      dashboardSessionCache.devicesResolved = false;
      dashboardSessionCache.devices = [];
      dashboardSessionCache.selectedDevEui = null;

      setActiveViewWithRoute("overview");
      setAuthMode("login");
      setAuthForm((previous) => ({
        ...previous,
        password: "",
      }));
    } catch (error) {
      setLogoutError(extractErrorMessage(error));
    } finally {
      setLogoutSubmitting(false);
    }
  };

  const handleClaimDevices = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setClaimSubmitting(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const payload = await apiRequest<ClaimDevicesResponse>("/api/devices/claim", {
        method: "POST",
        body: JSON.stringify({ claimCode }),
      });

      setDevices(payload.devices);
      dashboardSessionCache.devices = payload.devices;
      dashboardSessionCache.devicesResolved = true;

      setSelectedDevEui((current) => {
        const nextSelection =
          current && payload.devices.some((device) => device.devEui === current)
            ? current
            : payload.devices[0]?.devEui ?? null;

        dashboardSessionCache.selectedDevEui = nextSelection;
        return nextSelection;
      });

      setClaimCode("");
      setClaimSuccess(
        payload.claimedCount === 1
          ? "1 device linked to this account."
          : `${payload.claimedCount} devices linked to this account.`,
      );
      void loadFleetSummary();
    } catch (error) {
      setClaimError(extractErrorMessage(error));
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleCreateDevice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setCreateSubmitting(true);
    setCreateError(null);

    try {
      const latitude = parseCoordinateInput(createForm.latitude);
      const longitude = parseCoordinateInput(createForm.longitude);
      const unitLabel = parseUnitLabelInput(createForm.unitLabel);
      const createPayload: {
        devEui: string;
        name: string;
        utilityType: UtilityType;
        tariffPerUnit: number;
        unitLabel?: string;
        isActive: boolean;
        latitude?: number;
        longitude?: number;
      } = {
        devEui: createForm.devEui,
        name: createForm.name,
        utilityType: createForm.utilityType,
        tariffPerUnit: Number(createForm.tariffPerUnit),
        isActive: createForm.isActive,
      };

      if (unitLabel) {
        createPayload.unitLabel = unitLabel;
      }

      if (latitude !== null) {
        createPayload.latitude = latitude;
      }

      if (longitude !== null) {
        createPayload.longitude = longitude;
      }

      const payload = await apiRequest<{ device: PublicDevice }>("/api/devices", {
        method: "POST",
        body: JSON.stringify(createPayload),
      });

      setDevices((previous) => {
        const nextDevices = [payload.device, ...previous];
        dashboardSessionCache.devices = nextDevices;
        dashboardSessionCache.devicesResolved = true;
        return nextDevices;
      });
      setSelectedDevEui(payload.device.devEui);
      dashboardSessionCache.selectedDevEui = payload.device.devEui;

      setCreateForm({
        devEui: "",
        name: "",
        utilityType: createForm.utilityType,
        tariffPerUnit: createForm.tariffPerUnit,
        unitLabel: createForm.unitLabel,
        isActive: true,
        latitude: "",
        longitude: "",
      });
      setShowCreateDevice(false);
      setActiveViewWithRoute("devices");
      void loadFleetSummary();
    } catch (error) {
      setCreateError(extractErrorMessage(error));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleStartEditDevice = (device: PublicDevice) => {
    setEditingDevEui(device.devEui);
    setEditError(null);
    setEditForm({
      name: device.name,
      utilityType: device.utilityType,
      tariffPerUnit: String(device.tariffPerUnit),
      unitLabel: device.unitLabel,
      isActive: device.isActive,
      latitude: toCoordinateFormValue(device.latitude),
      longitude: toCoordinateFormValue(device.longitude),
    });
  };

  const handleCancelEditDevice = () => {
    setEditingDevEui(null);
    setEditError(null);
  };

  const handleEditDevice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingDevEui) {
      setEditError("No device selected for update.");
      return;
    }

    setEditSubmitting(true);
    setEditError(null);

    try {
      const latitude = parseCoordinateInput(editForm.latitude);
      const longitude = parseCoordinateInput(editForm.longitude);
      const unitLabel = parseUnitLabelInput(editForm.unitLabel);
      const updatePayload: {
        name: string;
        utilityType: UtilityType;
        tariffPerUnit: number;
        unitLabel?: string;
        isActive: boolean;
        latitude?: number;
        longitude?: number;
      } = {
        name: editForm.name,
        utilityType: editForm.utilityType,
        tariffPerUnit: Number(editForm.tariffPerUnit),
        isActive: editForm.isActive,
      };

      if (unitLabel) {
        updatePayload.unitLabel = unitLabel;
      }

      if (latitude !== null) {
        updatePayload.latitude = latitude;
      }

      if (longitude !== null) {
        updatePayload.longitude = longitude;
      }

      const payload = await apiRequest<{ device: PublicDevice }>(`/api/devices/${editingDevEui}`, {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });

      setDevices((previous) => {
        const nextDevices = previous.map((device) =>
          device.devEui === payload.device.devEui ? payload.device : device,
        );
        dashboardSessionCache.devices = nextDevices;
        dashboardSessionCache.devicesResolved = true;
        return nextDevices;
      });

      setEditingDevEui(null);
      void loadFleetSummary();
    } catch (error) {
      setEditError(extractErrorMessage(error));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSelectDevice = (devEui: string, targetView: ViewKey = "meter") => {
    setSelectedDevEui(devEui);
    setActiveViewWithRoute(targetView);
  };

  const activeNavItem = useMemo(
    () => NAV_ITEMS.find((item) => item.key === activeView) ?? NAV_ITEMS[0],
    [activeView],
  );

  return {
    bootLoading,
    language,
    user,
    authMode,
    authSubmitting,
    authError,
    logoutSubmitting,
    logoutError,
    authForm,
    activeView,
    devices,
    devicesWithCoordinates,
    devicesLoading,
    devicesError,
    selectedDevEui,
    claimCode,
    claimSubmitting,
    claimError,
    claimSuccess,
    searchQuery,
    statusFilter,
    showCreateDevice,
    createSubmitting,
    createError,
    createForm,
    editingDevEui,
    editSubmitting,
    editError,
    editForm,
    selectedReadings,
    selectedLatest,
    selectedCosts,
    selectedForecast,
    selectedForecastError,
    selectedDataLoading,
    selectedDataError,
    fleetSummary,
    fleetSummaryLoading,
    fleetSummaryError,
    streamStatus,
    streamError,
    lastHeartbeatAt,
    connectionInfo,
    latestByDevice,
    selectedDevice,
    deviceRows,
    filteredDeviceRows,
    selectedDeviceRow,
    activeDeviceCount,
    connectedCount,
    heartbeatCount,
    errorCount,
    fleetHealthPercent,
    topConsumers,
    liveByCategory,
    chartPaths,
    chartLabels,
    currentLoadWatts,
    currentLoadKw,
    currentConsumption,
    recentAlerts,
    activeNavItem,
    setAuthMode,
    setAuthError,
    setAuthForm,
    setClaimCode,
    setClaimError,
    setClaimSuccess,
    setSearchQuery,
    setStatusFilter,
    setShowCreateDevice,
    setCreateForm,
    setEditForm,
    setActiveViewWithRoute,
    setLanguage,
    loadDevices,
    loadFleetSummary,
    loadSelectedDeviceData,
    handleAuthSubmit,
    handleLogout,
    handleClaimDevices,
    handleCreateDevice,
    handleStartEditDevice,
    handleCancelEditDevice,
    handleEditDevice,
    handleSelectDevice,
  };
}

export type DashboardController = ReturnType<typeof useDashboardController>;
