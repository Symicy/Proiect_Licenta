import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useDeviceSse } from "@/lib/hooks/useDeviceSse";
import type { MeterReading } from "@/lib/services/influx.service";

import { NAV_ITEMS, VIEW_PATHS } from "../constants";
import type {
  AlertItem,
  AuthFormState,
  AuthMode,
  AuthResponse,
  CostResponse,
  CreateDeviceFormState,
  DeviceCostResult,
  DeviceRow,
  DevicesResponse,
  LatestReadingResponse,
  MeResponse,
  PublicDevice,
  PublicUser,
  RangeReadingsResponse,
  StatusFilter,
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

export function useDashboardController(initialView: ViewKey = "overview") {
  const router = useRouter();
  const pathname = usePathname();
  const initialRouteView = resolveViewFromPath(pathname) ?? initialView;

  const [bootLoading, setBootLoading] = useState(!dashboardSessionCache.bootResolved);
  const [user, setUser] = useState<PublicUser | null>(dashboardSessionCache.user);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState<AuthFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [activeView, setActiveView] = useState<ViewKey>(initialRouteView);
  const [devices, setDevices] = useState<PublicDevice[]>(dashboardSessionCache.devices);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [selectedDevEui, setSelectedDevEui] = useState<string | null>(dashboardSessionCache.selectedDevEui);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [showCreateDevice, setShowCreateDevice] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateDeviceFormState>({
    devEui: "",
    name: "",
    energyTariff: "0.25",
    isActive: true,
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
  const [selectedDataLoading, setSelectedDataLoading] = useState(false);
  const [selectedDataError, setSelectedDataError] = useState<string | null>(null);

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

  useEffect(() => {
    dashboardSessionCache.user = user;
  }, [user]);

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

      const [latestPayload, readingsPayload, todayCostPayload, weekCostPayload, monthCostPayload] =
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
        ]);

      setSelectedLatest(latestPayload.reading);
      setSelectedReadings(readingsPayload.readings);
      setSelectedCosts({
        today: todayCostPayload.cost,
        week: weekCostPayload.cost,
        month: monthCostPayload.cost,
      });
    } catch (error) {
      setSelectedDataError(extractErrorMessage(error));
      setSelectedLatest(null);
      setSelectedReadings([]);
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

      dashboardSessionCache.devicesResolved = false;
      dashboardSessionCache.devices = [];
      dashboardSessionCache.selectedDevEui = null;
      return;
    }

    if (dashboardSessionCache.devicesResolved) {
      setDevices(dashboardSessionCache.devices);
      setSelectedDevEui((current) => current ?? dashboardSessionCache.selectedDevEui ?? dashboardSessionCache.devices[0]?.devEui ?? null);
      return;
    }

    void loadDevices();
  }, [user, loadDevices]);

  useEffect(() => {
    if (!user || !selectedDevEui) {
      setSelectedLatest(null);
      setSelectedReadings([]);
      setSelectedCosts({
        today: null,
        week: null,
        month: null,
      });
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

      const status = resolveDeviceStatus(device, reading, streamStatus);

      return {
        device,
        reading,
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
        .filter((row) => row.loadWatts !== null)
        .sort((first, second) => (second.loadWatts ?? 0) - (first.loadWatts ?? 0))
        .slice(0, 4),
    [deviceRows],
  );

  const chartSeries = useMemo(
    () =>
      selectedReadings.map((reading) =>
        reading.voltage !== null && reading.current !== null ? reading.voltage * reading.current : null,
      ),
    [selectedReadings],
  );
  const chartPaths = useMemo(() => buildChartPaths(chartSeries), [chartSeries]);
  const chartLabels = useMemo(() => buildTimelineLabels(selectedReadings), [selectedReadings]);

  const currentLoadWatts =
    selectedLatest && selectedLatest.voltage !== null && selectedLatest.current !== null
      ? selectedLatest.voltage * selectedLatest.current
      : null;
  const currentLoadKw = currentLoadWatts !== null ? currentLoadWatts / 1000 : null;

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

  const handleCreateDevice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setCreateSubmitting(true);
    setCreateError(null);

    try {
      const payload = await apiRequest<{ device: PublicDevice }>("/api/devices", {
        method: "POST",
        body: JSON.stringify({
          devEui: createForm.devEui,
          name: createForm.name,
          energyTariff: Number(createForm.energyTariff),
          isActive: createForm.isActive,
        }),
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
        energyTariff: createForm.energyTariff,
        isActive: true,
      });
      setShowCreateDevice(false);
      setActiveViewWithRoute("devices");
    } catch (error) {
      setCreateError(extractErrorMessage(error));
    } finally {
      setCreateSubmitting(false);
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
    user,
    authMode,
    authSubmitting,
    authError,
    logoutSubmitting,
    logoutError,
    authForm,
    activeView,
    devices,
    devicesLoading,
    devicesError,
    selectedDevEui,
    searchQuery,
    statusFilter,
    showCreateDevice,
    createSubmitting,
    createError,
    createForm,
    selectedReadings,
    selectedLatest,
    selectedCosts,
    selectedDataLoading,
    selectedDataError,
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
    chartPaths,
    chartLabels,
    currentLoadWatts,
    currentLoadKw,
    recentAlerts,
    activeNavItem,
    setAuthMode,
    setAuthError,
    setAuthForm,
    setSearchQuery,
    setStatusFilter,
    setShowCreateDevice,
    setCreateForm,
    setActiveViewWithRoute,
    loadDevices,
    loadSelectedDeviceData,
    handleAuthSubmit,
    handleLogout,
    handleCreateDevice,
    handleSelectDevice,
  };
}

export type DashboardController = ReturnType<typeof useDashboardController>;
