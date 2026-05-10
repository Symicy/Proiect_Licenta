import { useState } from "react";
import dynamic from "next/dynamic";

import { UTILITY_TYPES, defaultUnitLabelForUtilityType, utilityTypeLabel } from "@/lib/utility";

import type { DashboardController } from "./hooks/useDashboardController";
import { UIIcon } from "./DashboardUI";
import {
  clamp,
  formatCurrency,
  formatQuantity,
  formatLoadWatts,
  formatRelativeTime,
  statusClasses,
  statusLabel,
} from "./utils";

type ViewProps = {
  controller: DashboardController;
};

type HomeMode = "summary" | "map";

const HOME_MODE_OPTIONS = [
  { value: "summary", label: "Summary", icon: "dashboard" },
  { value: "map", label: "Map", icon: "map" },
] as const satisfies Array<{ value: HomeMode; label: string; icon: string }>;

function MapCanvasSkeleton() {
  return (
    <div className="h-[460px] animate-pulse rounded-xl bg-surface-container-low" />
  );
}

const DeviceMapCanvas = dynamic(() => import("./components/DeviceMapCanvas"), {
  ssr: false,
  loading: () => <MapCanvasSkeleton />,
});

export function OverviewView({ controller }: ViewProps) {
  const {
    devices,
    activeDeviceCount,
    errorCount,
    fleetHealthPercent,
    fleetSummary,
    fleetSummaryLoading,
    fleetSummaryError,
    liveByCategory,
    recentAlerts,
    topConsumers,
    handleSelectDevice,
    streamStatus,
  } = controller;
  const utilityCategories = fleetSummary?.categories ?? [];
  const [homeMode, setHomeMode] = useState<HomeMode>("summary");

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-surface-container-high p-3 md:p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="px-1">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Home</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Fleet Overview</h2>
          </div>

          <div className="grid w-full grid-cols-2 rounded-full bg-surface-container-low p-1 md:w-auto">
            {HOME_MODE_OPTIONS.map((option) => {
              const isSelected = homeMode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                    isSelected
                      ? "bg-primary text-[#1a1766]"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
                  onClick={() => setHomeMode(option.value)}
                >
                  <UIIcon name={option.icon} className="text-[15px]" filled={isSelected} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {homeMode === "map" ? (
        <HomeMapPanel controller={controller} />
      ) : (
        <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Fleet Devices</p>
          <p className="mt-4 text-5xl font-black tracking-tight">{devices.length}</p>
          <p className="mt-2 text-xs text-on-surface-variant">{activeDeviceCount} active</p>
        </article>

        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Utility Categories</p>
          <p className="mt-4 text-5xl font-black tracking-tight">{fleetSummary?.totals.utilityCategoryCount ?? 0}</p>
          <p className="mt-2 text-xs text-on-surface-variant">Electricity, water, gas, heating, cooling, other</p>
        </article>

        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Fleet Cost (30d)</p>
          <p className="mt-4 text-5xl font-black tracking-tight">{formatCurrency(fleetSummary?.totals.monthEstimatedCost)}</p>
          <p className="mt-2 text-xs text-on-surface-variant">Today: {formatCurrency(fleetSummary?.totals.todayEstimatedCost)}</p>
        </article>

        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Fleet Health</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-5xl font-black tracking-tight text-tertiary">{fleetHealthPercent}%</p>
            <p className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">{errorCount} critical</p>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">Stream: {streamStatus}</p>
        </article>
      </section>

      <section className="rounded-xl bg-surface-container-high p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Consumption By Utility Category</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Aggregated by category for today, week, and 30 days.</p>
          </div>
          <p className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">Today / Week / 30d</p>
        </div>

        {fleetSummaryLoading ? (
          <div className="mt-5 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            Loading category summary...
          </div>
        ) : null}

        {fleetSummaryError ? (
          <div className="mt-5 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
            {fleetSummaryError}
          </div>
        ) : null}

        {!fleetSummaryLoading && !fleetSummaryError ? (
          utilityCategories.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {utilityCategories.map((category) => (
                <article
                  key={`category-${category.utilityType}-${category.unitLabel}`}
                  className="rounded-lg bg-surface-container-low p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold">{utilityTypeLabel(category.utilityType)}</h4>
                    <span className="text-xs text-on-surface-variant">
                      {category.activeDeviceCount}/{category.deviceCount} active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">Unit: {category.unitLabel}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md bg-surface px-3 py-2">
                      <p className="text-on-surface-variant">Today</p>
                      <p className="mt-1 font-semibold">{formatQuantity(category.today.consumedUnits)} {category.unitLabel}</p>
                      <p className="mt-0.5 font-mono">{formatCurrency(category.today.estimatedCost)}</p>
                    </div>
                    <div className="rounded-md bg-surface px-3 py-2">
                      <p className="text-on-surface-variant">Week</p>
                      <p className="mt-1 font-semibold">{formatQuantity(category.week.consumedUnits)} {category.unitLabel}</p>
                      <p className="mt-0.5 font-mono">{formatCurrency(category.week.estimatedCost)}</p>
                    </div>
                    <div className="rounded-md bg-surface px-3 py-2">
                      <p className="text-on-surface-variant">30d</p>
                      <p className="mt-1 font-semibold">{formatQuantity(category.month.consumedUnits)} {category.unitLabel}</p>
                      <p className="mt-0.5 font-mono">{formatCurrency(category.month.estimatedCost)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              No category data available yet.
            </p>
          )
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <article className="rounded-xl bg-surface-container-high p-6 xl:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Live Snapshot By Utility</h3>
            <span className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">stream</span>
          </div>

          {liveByCategory.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Devices</th>
                    <th className="pb-3 pr-4">Latest Consumption</th>
                    <th className="pb-3 pr-4">Live Cost Snapshot</th>
                  </tr>
                </thead>
                <tbody>
                  {liveByCategory.map((category) => (
                    <tr key={`live-${category.utilityType}-${category.unitLabel}`} className="border-t border-outline-variant/20">
                      <td className="py-3 pr-4 font-semibold">{utilityTypeLabel(category.utilityType)}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{category.deviceCount}</td>
                      <td className="py-3 pr-4 font-mono">{formatQuantity(category.latestConsumption)} {category.unitLabel}</td>
                      <td className="py-3 pr-4 font-mono">{formatCurrency(category.liveEstimatedCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Waiting for live telemetry to build category snapshot.
            </p>
          )}
        </article>

        <article className="rounded-xl bg-surface-container-high p-6 xl:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Alerts</h3>
            <span className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">live</span>
          </div>

          <div className="mt-5 space-y-3">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className={`rounded-lg px-4 py-3 ${
                    alert.level === "error" ? "bg-error/10 text-error" : "bg-surface-container-low text-on-surface"
                  }`}
                >
                  <p className="inline-flex items-center gap-2 text-sm font-semibold">
                    <UIIcon name={alert.level === "error" ? "warning" : "info"} className="text-[16px]" />
                    {alert.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">{alert.body}</p>
                </article>
              ))
            ) : (
              <p className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                No active alerts. Stream heartbeat is stable.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-xl bg-surface-container-high p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Top Devices By Latest Usage</h3>
          <span className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">live ranking</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {topConsumers.length > 0 ? (
            topConsumers.map((row) => (
              <button
                type="button"
                key={row.device.devEui}
                className="rounded-lg bg-surface-container-low px-4 py-3 text-left transition hover:bg-surface-container-highest"
                onClick={() => handleSelectDevice(row.device.devEui, "meter")}
              >
                <p className="text-sm font-semibold">{row.device.name}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{row.device.devEui}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{utilityTypeLabel(row.device.utilityType)}</p>
                <p className="mt-2 text-lg font-bold">
                  {formatQuantity(row.latestConsumption)} {row.device.unitLabel}
                </p>
              </button>
            ))
          ) : (
            <p className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              No usage values available yet.
            </p>
          )}
        </div>
      </section>
        </>
      )}
    </div>
  );
}

export function DevicesView({ controller }: ViewProps) {
  const {
    devices,
    connectedCount,
    errorCount,
    searchQuery,
    statusFilter,
    filteredDeviceRows,
    showCreateDevice,
    createForm,
    createError,
    createSubmitting,
    editingDevEui,
    editForm,
    editError,
    editSubmitting,
    setSearchQuery,
    setStatusFilter,
    handleSelectDevice,
    setShowCreateDevice,
    handleCreateDevice,
    setCreateForm,
    setEditForm,
    handleStartEditDevice,
    handleCancelEditDevice,
    handleEditDevice,
  } = controller;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-surface-container-high p-5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Total Fleet</p>
          <p className="mt-3 text-5xl font-black tracking-tight">{devices.length}</p>
        </article>
        <article className="rounded-xl bg-surface-container-high p-5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Connected</p>
          <p className="mt-3 text-5xl font-black tracking-tight text-tertiary">{connectedCount}</p>
        </article>
        <article className="rounded-xl bg-surface-container-high p-5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">Critical Errors</p>
          <p className="mt-3 text-5xl font-black tracking-tight text-error">{errorCount}</p>
        </article>
      </section>

      <section className="rounded-xl bg-surface-container-high p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-96">
            <div className="relative">
              <UIIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
              <input
                className="w-full rounded-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 pl-11 text-sm outline-none transition focus:border-primary"
                placeholder="Search by devEui or device name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "connected", "heartbeat", "error", "inactive"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${
                  statusFilter === value
                    ? "bg-primary text-[#1a1766]"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
                }`}
                onClick={() => setStatusFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                <th className="pb-3 pr-4">Device Name</th>
                <th className="pb-3 pr-4">devEui</th>
                <th className="pb-3 pr-4">Utility</th>
                <th className="pb-3 pr-4">Tariff</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Last Seen</th>
                <th className="pb-3 pr-4 text-right">Load (W)</th>
                <th className="pb-3 pr-4">Coordinates</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeviceRows.map((row) => (
                <tr
                  key={row.device.id}
                  className="border-t border-outline-variant/20 text-sm hover:bg-surface-container-low"
                >
                  <td className="py-4 pr-4 font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <UIIcon name="aod" className="text-[16px] text-primary" />
                      {row.device.name}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs text-on-surface-variant">{row.device.devEui}</td>
                  <td className="py-4 pr-4 text-on-surface-variant">{utilityTypeLabel(row.device.utilityType)}</td>
                  <td className="py-4 pr-4 font-mono text-xs text-on-surface-variant">
                    {formatCurrency(row.device.tariffPerUnit)} / {row.device.unitLabel}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${statusClasses(
                        row.status,
                      )}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-on-surface-variant">{row.lastSeen}</td>
                  <td className="py-4 pr-4 text-right font-mono">{formatLoadWatts(row.loadWatts)}</td>
                  <td className="py-4 pr-4 font-mono text-xs text-on-surface-variant">
                    {typeof row.device.latitude === "number" && typeof row.device.longitude === "number"
                      ? `${row.device.latitude.toFixed(5)}, ${row.device.longitude.toFixed(5)}`
                      : "Not set"}
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-[#1a1766]"
                        onClick={() => handleSelectDevice(row.device.devEui, "meter")}
                      >
                        <UIIcon name="visibility" className="text-[14px]" />
                        Details
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-high"
                        onClick={() => handleStartEditDevice(row.device)}
                      >
                        <UIIcon name="edit" className="text-[14px]" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDeviceRows.length === 0 ? (
          <p className="mt-4 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            No devices matched your filters.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl bg-surface-container-high p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Register New Device</h3>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary"
            onClick={() => setShowCreateDevice((previous) => !previous)}
          >
            <UIIcon name={showCreateDevice ? "expand_less" : "add_box"} className="text-[14px]" />
            {showCreateDevice ? "Hide form" : "Open form"}
          </button>
        </div>

        {showCreateDevice ? (
          <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreateDevice}>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                devEui
              </span>
              <input
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 font-mono text-sm outline-none transition focus:border-primary"
                placeholder="a840410000000000"
                value={createForm.devEui}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    devEui: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Device Name
              </span>
              <input
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="Main Chiller Plant"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Utility Type
              </span>
              <select
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={createForm.utilityType}
                onChange={(event) =>
                  setCreateForm((previous) => {
                    const nextUtilityType = event.target.value as typeof previous.utilityType;
                    const previousDefaultUnit = defaultUnitLabelForUtilityType(previous.utilityType);
                    const nextDefaultUnit = defaultUnitLabelForUtilityType(nextUtilityType);

                    return {
                      ...previous,
                      utilityType: nextUtilityType,
                      unitLabel: previous.unitLabel === previousDefaultUnit ? nextDefaultUnit : previous.unitLabel,
                    };
                  })
                }
              >
                {UTILITY_TYPES.map((utilityType) => (
                  <option key={`create-utility-${utilityType}`} value={utilityType}>
                    {utilityTypeLabel(utilityType)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Tariff (USD/{createForm.unitLabel || "unit"})
              </span>
              <input
                type="number"
                min="0"
                step="0.0001"
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={createForm.tariffPerUnit}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    tariffPerUnit: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Unit Label
              </span>
              <input
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={createForm.unitLabel}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    unitLabel: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Latitude (optional)
              </span>
              <input
                type="number"
                min="-90"
                max="90"
                step="0.000001"
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="44.4268"
                value={createForm.latitude}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    latitude: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Longitude (optional)
              </span>
              <input
                type="number"
                min="-180"
                max="180"
                step="0.000001"
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="26.1025"
                value={createForm.longitude}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    longitude: event.target.value,
                  }))
                }
              />
            </label>

            <label className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(event) =>
                  setCreateForm((previous) => ({
                    ...previous,
                    isActive: event.target.checked,
                  }))
                }
              />
              Mark device as active
            </label>

            <div className="md:col-span-2">
              {createError ? <p className="mb-3 text-sm text-error">{createError}</p> : null}

              <button
                type="submit"
                className="primary-gradient-bg inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={createSubmitting}
              >
                <UIIcon name="add" className="text-[16px]" />
                {createSubmitting ? "Creating..." : "Create Device"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="rounded-xl bg-surface-container-high p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Edit Device</h3>
          {editingDevEui ? (
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-on-surface-variant">
              {editingDevEui}
            </p>
          ) : null}
        </div>

        {!editingDevEui ? (
          <p className="mt-4 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            Choose a device and click Edit in the table to update metadata or coordinates.
          </p>
        ) : (
          <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleEditDevice}>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Device Name
              </span>
              <input
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Utility Type
              </span>
              <select
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={editForm.utilityType}
                onChange={(event) =>
                  setEditForm((previous) => {
                    const nextUtilityType = event.target.value as typeof previous.utilityType;
                    const previousDefaultUnit = defaultUnitLabelForUtilityType(previous.utilityType);
                    const nextDefaultUnit = defaultUnitLabelForUtilityType(nextUtilityType);

                    return {
                      ...previous,
                      utilityType: nextUtilityType,
                      unitLabel: previous.unitLabel === previousDefaultUnit ? nextDefaultUnit : previous.unitLabel,
                    };
                  })
                }
              >
                {UTILITY_TYPES.map((utilityType) => (
                  <option key={`edit-utility-${utilityType}`} value={utilityType}>
                    {utilityTypeLabel(utilityType)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Tariff (USD/{editForm.unitLabel || "unit"})
              </span>
              <input
                type="number"
                min="0"
                step="0.0001"
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={editForm.tariffPerUnit}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    tariffPerUnit: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Unit Label
              </span>
              <input
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={editForm.unitLabel}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    unitLabel: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Latitude (optional)
              </span>
              <input
                type="number"
                min="-90"
                max="90"
                step="0.000001"
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={editForm.latitude}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    latitude: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Longitude (optional)
              </span>
              <input
                type="number"
                min="-180"
                max="180"
                step="0.000001"
                className="w-full rounded-t-lg border-b-2 border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
                value={editForm.longitude}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    longitude: event.target.value,
                  }))
                }
              />
            </label>

            <label className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    isActive: event.target.checked,
                  }))
                }
              />
              Mark device as active
            </label>

            <div className="md:col-span-2">
              {editError ? <p className="mb-3 text-sm text-error">{editError}</p> : null}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="primary-gradient-bg inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={editSubmitting}
                >
                  <UIIcon name="edit" className="text-[16px]" />
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleCancelEditDevice}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function HomeMapPanel({ controller }: ViewProps) {
  const {
    devices,
    devicesWithCoordinates,
    devicesLoading,
    selectedDevEui,
    handleSelectDevice,
    setShowCreateDevice,
    setActiveViewWithRoute,
  } = controller;

  const selectedMappedDevice =
    devicesWithCoordinates.find((device) => device.devEui === selectedDevEui) ?? null;

  if (devicesLoading && devices.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant">
          Loading device locations...
        </div>
        <MapCanvasSkeleton />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-high p-8 text-sm text-on-surface-variant">
        <p>No devices registered yet. Add at least one device before using the map.</p>
        <button
          type="button"
          className="primary-gradient-bg mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#1a1766]"
          onClick={() => {
            setShowCreateDevice(true);
            setActiveViewWithRoute("devices");
          }}
        >
          <UIIcon name="add" className="text-[14px]" />
          Add Device
        </button>
      </div>
    );
  }

  if (devicesWithCoordinates.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-high p-8 text-sm text-on-surface-variant">
        <p>No devices have coordinates yet. Add latitude/longitude in the Devices tab to place markers.</p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-[#1a1766]"
          onClick={() => setActiveViewWithRoute("devices")}
        >
          <UIIcon name="edit" className="text-[14px]" />
          Open Devices
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <section className="rounded-xl bg-surface-container-high p-4 xl:col-span-8">
        <DeviceMapCanvas
          devices={devicesWithCoordinates}
          selectedDevEui={selectedDevEui}
          onSelectDevice={(devEui) => handleSelectDevice(devEui, "overview")}
          defaultCenter={[45.9432, 24.9668]}
          defaultZoom={6}
        />
      </section>

      <aside className="space-y-4 rounded-xl bg-surface-container-high p-5 xl:col-span-4">
        <h3 className="text-xl font-bold">Map Selection</h3>

        {selectedMappedDevice ? (
          <article className="rounded-lg bg-surface-container-low p-4">
            <p className="text-sm font-semibold">{selectedMappedDevice.name}</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant">{selectedMappedDevice.devEui}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{utilityTypeLabel(selectedMappedDevice.utilityType)}</p>
            <p className="mt-3 font-mono text-xs text-on-surface-variant">
              {selectedMappedDevice.latitude.toFixed(5)}, {selectedMappedDevice.longitude.toFixed(5)}
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-[#1a1766]"
              onClick={() => handleSelectDevice(selectedMappedDevice.devEui, "meter")}
            >
              <UIIcon name="visibility" className="text-[14px]" />
              Open Meter
            </button>
          </article>
        ) : (
          <p className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            Select a marker to inspect a device location.
          </p>
        )}

        <div className="space-y-2">
          {devicesWithCoordinates.map((device) => {
            const isSelected = device.devEui === selectedDevEui;
            return (
              <button
                key={`map-list-${device.id}`}
                type="button"
                className={`w-full rounded-lg px-4 py-3 text-left transition ${
                  isSelected
                    ? "bg-primary text-[#1a1766]"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container-highest"
                }`}
                onClick={() => handleSelectDevice(device.devEui, "overview")}
              >
                <p className="text-sm font-semibold">{device.name}</p>
                <p className={`mt-1 text-xs ${isSelected ? "text-[#1a1766]/80" : "text-on-surface-variant"}`}>
                  {utilityTypeLabel(device.utilityType)}
                </p>
                <p className={`mt-1 font-mono text-xs ${isSelected ? "text-[#1a1766]/80" : "text-on-surface-variant"}`}>
                  {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                </p>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

export function MeterView({ controller }: ViewProps) {
  const {
    selectedDevice,
    selectedDeviceRow,
    selectedDataError,
    currentLoadWatts,
    currentLoadKw,
    currentConsumption,
    selectedLatest,
    streamStatus,
    lastHeartbeatAt,
    selectedCosts,
    chartPaths,
    chartLabels,
  } = controller;

  if (!selectedDevice) {
    return (
      <div className="rounded-xl bg-surface-container-high p-8 text-sm text-on-surface-variant">
        Select or register a device to open meter details.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-surface-container-high p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">Device | {selectedDevice.devEui}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{selectedDevice.name}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {utilityTypeLabel(selectedDevice.utilityType)} | {formatCurrency(selectedDevice.tariffPerUnit)} / {selectedDevice.unitLabel}
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${statusClasses(
              selectedDeviceRow?.status ?? "heartbeat",
            )}`}
          >
            {statusLabel(selectedDeviceRow?.status ?? "heartbeat")}
          </span>
        </div>
      </section>

      {selectedDataError ? (
        <div className="rounded-xl bg-error/10 p-4 text-sm text-error">{selectedDataError}</div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-xl bg-surface-container-high p-6 xl:col-span-4">
          <h3 className="text-xl font-bold">Live Readings</h3>

          <div className="mt-5 rounded-xl bg-surface-container-low p-5">
            <div className="relative mx-auto h-40 w-56 overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 220 140">
                <path d="M20 120 A90 90 0 0 1 200 120" stroke="#2d3449" strokeWidth="18" fill="none" strokeLinecap="round" />
                <path
                  d="M20 120 A90 90 0 0 1 200 120"
                  stroke="#c0c1ff"
                  strokeWidth="18"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="340"
                  strokeDashoffset={340 - 340 * clamp((currentLoadWatts ?? 0) / 6000, 0, 1)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
                <p className="text-4xl font-black tracking-tight">{currentLoadKw !== null ? currentLoadKw.toFixed(2) : "--"}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">kW load</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-surface-container px-4 py-3">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">Consumption</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatQuantity(currentConsumption)}
                  <span className="ml-1 text-sm font-medium text-on-surface-variant">{selectedDevice.unitLabel}</span>
                </p>
              </div>
              <div className="rounded-lg bg-surface-container px-4 py-3">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">Voltage</p>
                <p className="mt-1 text-2xl font-bold">
                  {selectedLatest?.voltage?.toFixed(1) ?? "--"}
                  <span className="ml-1 text-sm font-medium text-on-surface-variant">V</span>
                </p>
              </div>
              <div className="rounded-lg bg-surface-container px-4 py-3">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">Current</p>
                <p className="mt-1 text-2xl font-bold">
                  {selectedLatest?.current?.toFixed(1) ?? "--"}
                  <span className="ml-1 text-sm font-medium text-on-surface-variant">A</span>
                </p>
              </div>
            </div>
          </div>
        </article>

        <div className="space-y-6 xl:col-span-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="rounded-xl bg-surface-container-high p-6 md:col-span-1">
              <p className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                <UIIcon name="wifi_tethering" className="text-[15px]" />
                Stream Health
              </p>
              <p className="mt-3 text-lg font-semibold text-tertiary">{streamStatus === "open" ? "Excellent" : streamStatus}</p>
              <p className="mt-1 text-sm text-on-surface-variant">Heartbeat: {lastHeartbeatAt ? formatRelativeTime(lastHeartbeatAt) : "--"}</p>
            </article>

            <article className="rounded-xl bg-surface-container-high p-6 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                  <UIIcon name="payments" className="text-[15px]" />
                  Cost Estimation
                </p>
                <button
                  type="button"
                  className="rounded-full bg-surface-container-highest p-2 text-on-surface-variant transition hover:text-primary"
                  title="Download report"
                >
                  <UIIcon name="download" className="text-[18px]" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-on-surface-variant">Today</p>
                  <p className="mt-1 text-xl font-bold">{formatCurrency(selectedCosts.today?.estimatedCost)}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {formatQuantity(selectedCosts.today?.consumedUnits)} {selectedDevice.unitLabel}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant">This Week</p>
                  <p className="mt-1 text-xl font-bold">{formatCurrency(selectedCosts.week?.estimatedCost)}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {formatQuantity(selectedCosts.week?.consumedUnits)} {selectedDevice.unitLabel}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant">This Month</p>
                  <p className="mt-1 text-xl font-bold text-primary">{formatCurrency(selectedCosts.month?.estimatedCost)}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {formatQuantity(selectedCosts.month?.consumedUnits)} {selectedDevice.unitLabel}
                  </p>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-xl bg-surface-container-high p-6">
            <h3 className="text-xl font-bold">24h Consumption Profile</h3>
            {chartPaths.linePath ? (
              <div className="mt-5 h-72 rounded-xl bg-surface-container-low p-4">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="meterFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#0b1326" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={chartPaths.areaPath} fill="url(#meterFill)" />
                  <path
                    d={chartPaths.linePath}
                    fill="none"
                    stroke="#c0c1ff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="0.8"
                  />
                </svg>
                <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
                  {chartLabels.map((label, index) => (
                    <span key={`${label}-meter-${index}`}>{label}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
                No profile data yet for this device.
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

export function BillingView({ controller }: ViewProps) {
  const {
    selectedDevice,
    selectedCosts,
    selectedDataLoading,
    deviceRows,
  } = controller;
  const selectedUnitLabel = selectedDevice?.unitLabel ?? selectedCosts.month?.unitLabel ?? "unit";

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">Today</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{formatCurrency(selectedCosts.today?.estimatedCost)}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.08em] text-on-surface-variant">
            {formatQuantity(selectedCosts.today?.consumedUnits)} {selectedUnitLabel} consumed
          </p>
        </article>
        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">This Week</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{formatCurrency(selectedCosts.week?.estimatedCost)}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.08em] text-on-surface-variant">
            {formatQuantity(selectedCosts.week?.consumedUnits)} {selectedUnitLabel} consumed
          </p>
        </article>
        <article className="rounded-xl bg-surface-container-high p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">This Month</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-primary">{formatCurrency(selectedCosts.month?.estimatedCost)}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.08em] text-on-surface-variant">
            {formatQuantity(selectedCosts.month?.consumedUnits)} {selectedUnitLabel} consumed
          </p>
        </article>
      </section>

      {selectedDataLoading ? (
        <div className="rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant">
          Refreshing billing and telemetry summaries...
        </div>
      ) : null}

      <section className="rounded-xl bg-surface-container-high p-6">
        <h3 className="text-xl font-bold">Fleet Billing Projection</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Instant estimate using latest cumulative consumption and configured tariff per unit.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead>
              <tr className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                <th className="pb-3 pr-4">Device</th>
                <th className="pb-3 pr-4">Utility</th>
                <th className="pb-3 pr-4">Tariff</th>
                <th className="pb-3 pr-4">Latest Consumption</th>
                <th className="pb-3 pr-4">Est. Cumulative Cost</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {deviceRows.map((row) => {
                const cumulativeCost =
                  row.latestConsumption !== null ? row.latestConsumption * row.device.tariffPerUnit : null;

                return (
                  <tr key={`billing-${row.device.id}`} className="border-t border-outline-variant/20 text-sm">
                    <td className="py-4 pr-4 font-semibold">{row.device.name}</td>
                    <td className="py-4 pr-4 text-on-surface-variant">{utilityTypeLabel(row.device.utilityType)}</td>
                    <td className="py-4 pr-4 font-mono">
                      {formatCurrency(row.device.tariffPerUnit)} / {row.device.unitLabel}
                    </td>
                    <td className="py-4 pr-4 font-mono">
                      {formatQuantity(row.latestConsumption)} {row.device.unitLabel}
                    </td>
                    <td className="py-4 pr-4 font-mono">{formatCurrency(cumulativeCost)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${statusClasses(
                          row.status,
                        )}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

