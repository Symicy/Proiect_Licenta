import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import dynamic from "next/dynamic";

import { UTILITY_TYPES, defaultUnitLabelForUtilityType, type UtilityType, utilityTypeLabel } from "@/lib/utility";
import type { MeterReading } from "@/lib/services/influx.service";

import {
  BillingUtilityChart,
  FleetCostDonut,
  ForecastComparisonChart,
  MeterAreaChart,
  TopConsumersChart,
  UtilityConsumptionChart,
  type BillingChartPoint,
  type DeviceRankingPoint,
  type ForecastSeriesPoint,
  type MeterSeriesPoint,
  type UtilityChartPoint,
  utilityColor,
} from "./DashboardCharts";
import { UIIcon } from "./DashboardUI";
import type { DashboardController } from "./hooks/useDashboardController";
import { translateText } from "./i18n";
import type { CreateDeviceFormState, DeviceRow, ForecastResponse, UpdateDeviceFormState } from "./types";
import {
  clamp,
  formatCurrency,
  formatLoadWatts,
  formatQuantity,
  formatRelativeTime,
  statusClasses,
  statusLabel,
} from "./utils";

type ViewProps = {
  controller: DashboardController;
};

type HomeMode = "summary" | "map";
type MapUtilityFilter = "all" | UtilityType;

const HOME_MODE_OPTIONS = [
  { value: "summary", label: "Summary", icon: "dashboard" },
  { value: "map", label: "Map", icon: "map" },
] as const satisfies Array<{ value: HomeMode; label: string; icon: string }>;

const STATUS_FILTERS = ["all", "connected", "heartbeat", "error", "inactive"] as const;
const DEVICE_PAGE_SIZE = 10;
const BILLING_PAGE_SIZE = 10;

function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

function getCurrentPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function getPageWindow<TItem>(items: TItem[], page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

function MapCanvasSkeleton() {
  return <div className="h-[clamp(540px,calc(100vh-290px),790px)] min-h-[540px] animate-pulse rounded-lg bg-surface-container-low" />;
}

const DeviceMapCanvas = dynamic(() => import("./components/DeviceMapCanvas"), {
  ssr: false,
  loading: () => <MapCanvasSkeleton />,
});

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`rounded-lg bg-surface-container-high p-5 md:p-6 ${className}`.trim()}>{children}</section>;
}

function SectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function SegmentedButton({
  isSelected,
  children,
  onClick,
}: {
  isSelected: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-[0.08em] transition ${
        isSelected
          ? "bg-primary text-[#1a1766]"
          : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  tone?: "primary" | "success" | "warning" | "neutral";
}) {
  const toneClasses = {
    primary: "bg-primary/12 text-primary",
    success: "bg-tertiary/10 text-tertiary",
    warning: "bg-error/10 text-error",
    neutral: "bg-surface-container-highest text-on-surface",
  };

  return (
    <article className="rounded-lg bg-surface-container-high p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
        </div>
        <span className={`inline-flex rounded-lg p-2 ${toneClasses[tone]}`}>
          <UIIcon name={icon} className="text-[18px]" filled />
        </span>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">{detail}</p>
    </article>
  );
}

function QuantityWithUnit({
  value,
  unit,
  valueClassName = "font-mono",
}: {
  value: number | null | undefined;
  unit: string;
  valueClassName?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span className={valueClassName}>{formatQuantity(value)}</span>
      <span className="text-xs text-on-surface-variant">{unit}</span>
    </span>
  );
}

function localizedUtilityTypeLabel(language: DashboardController["language"], utilityType: UtilityType) {
  return translateText(language, utilityTypeLabel(utilityType));
}

function localizedStatusLabel(language: DashboardController["language"], status: DeviceRow["status"]) {
  return translateText(language, statusLabel(status));
}

function UtilityChip({ utilityType, language }: { utilityType: UtilityType; language: DashboardController["language"] }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-semibold">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: utilityColor(utilityType) }} />
      {localizedUtilityTypeLabel(language, utilityType)}
    </span>
  );
}

function StatusChip({ status, language }: { status: DeviceRow["status"]; language: DashboardController["language"] }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${statusClasses(status)}`}>
      {localizedStatusLabel(language, status)}
    </span>
  );
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= pageSize) {
    return null;
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        Showing {startItem}-{endItem} of {totalItems}
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-surface-container-high px-3 text-xs font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <UIIcon name="chevron_left" className="text-[15px]" />
          Previous
        </button>
        <span className="min-w-16 rounded-full bg-surface-container-highest px-3 py-2 text-center font-mono text-xs text-on-surface">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-surface-container-high px-3 text-xs font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <UIIcon name="chevron_right" className="text-[15px]" />
        </button>
      </div>
    </div>
  );
}

function toUtilityChartPoints(controller: DashboardController): UtilityChartPoint[] {
  return (controller.fleetSummary?.categories ?? []).map((category) => ({
    utilityType: category.utilityType,
    label: translateText(controller.language, utilityTypeLabel(category.utilityType)),
    unitLabel: category.unitLabel,
    today: category.today.consumedUnits,
    week: category.week.consumedUnits,
    month: category.month.consumedUnits,
    cost: category.month.estimatedCost,
    devices: category.deviceCount,
    active: category.activeDeviceCount,
  }));
}

function toTopConsumerPoints(rows: DeviceRow[]): DeviceRankingPoint[] {
  return rows
    .filter((row) => row.latestConsumption !== null)
    .sort((first, second) => (second.latestConsumption ?? 0) - (first.latestConsumption ?? 0))
    .slice(0, 6)
    .map((row) => ({
      name: row.device.name,
      devEui: row.device.devEui,
      utilityType: row.device.utilityType,
      value: row.latestConsumption ?? 0,
      unitLabel: row.device.unitLabel,
    }));
}

function toMeterSeries(readings: MeterReading[]): MeterSeriesPoint[] {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour12: false,
  });

  const validReadings = readings
    .filter((reading) => reading.consumption !== null && Number.isFinite(reading.consumption))
    .sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));

  const dailyTotals = new Map<string, MeterSeriesPoint>();

  validReadings.slice(1).forEach((reading, index) => {
    const previous = validReadings[index]?.consumption ?? reading.consumption ?? 0;
    const current = reading.consumption ?? previous;
    const timestamp = new Date(reading.timestamp);
    const key = timestamp.toISOString().slice(0, 10);
    const existing = dailyTotals.get(key);
    const consumption = Math.max(current - previous, 0);

    if (existing) {
      existing.consumption += consumption;
      return;
    }

    dailyTotals.set(key, {
      timestamp: reading.timestamp,
      label: formatter.format(timestamp),
      consumption,
      average: null,
    });
  });

  const dailySeries = [...dailyTotals.values()].sort(
    (first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp),
  );

  return dailySeries.map((point, index) => {
    const window = dailySeries.slice(Math.max(0, index - 6), index + 1);
    const average = window.reduce((sum, item) => sum + item.consumption, 0) / window.length;

    return {
      ...point,
      consumption: Number(point.consumption.toFixed(4)),
      average: Number(average.toFixed(4)),
    };
  });
}

function toForecastSeries(forecast: ForecastResponse | null): ForecastSeriesPoint[] {
  if (!forecast) {
    return [];
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const stepMs = forecast.query.stepHours * 60 * 60 * 1000;
  const visibleObservedStart = Date.parse(forecast.query.stop) - 72 * 60 * 60 * 1000;
  const observedReadings = forecast.observed
    .filter((reading) => reading.consumption !== null && Number.isFinite(reading.consumption))
    .sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
  const visibleObservedReadings = observedReadings.filter(
    (reading) => Date.parse(reading.timestamp) >= visibleObservedStart - stepMs,
  );

  const observed: ForecastSeriesPoint[] = visibleObservedReadings.slice(1).flatMap((reading, index) => {
    const previous = visibleObservedReadings[index]?.consumption ?? reading.consumption ?? 0;
    const current = reading.consumption ?? previous;
    if (Date.parse(reading.timestamp) < visibleObservedStart) {
      return [];
    }

    return [{
      timestamp: reading.timestamp,
      label: formatter.format(new Date(reading.timestamp)),
      observed: Number(Math.max(current - previous, 0).toFixed(4)),
      predicted: null,
      lower: null,
      upper: null,
    }];
  });

  let previousForecastBase = observedReadings.at(-1)?.consumption ?? null;
  const forecastPoints: ForecastSeriesPoint[] = forecast.forecast.map((point) => {
    const previous = previousForecastBase ?? point.value;
    previousForecastBase = point.value;

    return {
      timestamp: point.timestamp,
      label: formatter.format(new Date(point.timestamp)),
      observed: null,
      predicted: Number(Math.max(point.value - previous, 0).toFixed(4)),
      lower: point.lower === null ? null : Number(Math.max(point.lower - previous, 0).toFixed(4)),
      upper: point.upper === null ? null : Number(Math.max(point.upper - previous, 0).toFixed(4)),
    };
  });

  const lastObserved = observed.at(-1);

  if (lastObserved && forecastPoints.length > 0) {
    lastObserved.predicted = lastObserved.observed;
    lastObserved.lower = lastObserved.observed;
    lastObserved.upper = lastObserved.observed;
  }

  return [...observed, ...forecastPoints];
}

function forecastStatusMessage(forecast: ForecastResponse | null, error: string | null) {
  if (error) {
    return error;
  }

  if (!forecast) {
    return "Forecast has not been loaded yet.";
  }

  if (forecast.model.status === "insufficient_data") {
    return "ARIMA needs at least 12 valid historical points. Keep the simulator running to build enough history.";
  }

  if (forecast.model.status === "service_unavailable") {
    return "Forecast service is not available. Telemetry remains visible; start the forecast service to generate ARIMA predictions.";
  }

  if (forecast.model.status === "model_error") {
    return "ARIMA could not fit this device history. Try again after more regular telemetry is available.";
  }

  return null;
}

function sortedConsumptionReadings(readings: MeterReading[], latest: MeterReading | null | undefined) {
  const byTimestamp = new Map<string, MeterReading>();

  readings.forEach((reading) => {
    if (reading.consumption !== null && Number.isFinite(reading.consumption)) {
      byTimestamp.set(reading.timestamp, reading);
    }
  });

  if (latest?.consumption !== null && latest?.consumption !== undefined && Number.isFinite(latest.consumption)) {
    byTimestamp.set(latest.timestamp, latest);
  }

  return [...byTimestamp.values()].sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
}

function latestConsumptionRate(readings: MeterReading[], latest: MeterReading | null | undefined) {
  const points = sortedConsumptionReadings(readings, latest);
  if (points.length < 2) {
    return null;
  }

  const current = points.at(-1);
  const previous = points.at(-2);
  if (!current || !previous || current.consumption === null || previous.consumption === null) {
    return null;
  }

  const elapsedHours = (Date.parse(current.timestamp) - Date.parse(previous.timestamp)) / (60 * 60 * 1000);
  if (!Number.isFinite(elapsedHours) || elapsedHours <= 0) {
    return null;
  }

  return Math.max(current.consumption - previous.consumption, 0) / elapsedHours;
}

function rateUnitForDevice(device: { unitLabel: string; utilityType: UtilityType }) {
  if (device.unitLabel.toLowerCase() === "kwh") {
    return "kW";
  }

  return `${device.unitLabel}/h`;
}

function rateLabelForUtility(utilityType: UtilityType) {
  if (utilityType === "GAS" || utilityType === "WATER") {
    return "Flow Rate";
  }

  if (utilityType === "HEATING" || utilityType === "COOLING") {
    return "Thermal Rate";
  }

  return "Usage Rate";
}

function deviceRateDisplay(row: DeviceRow) {
  if (row.device.utilityType === "ELECTRICITY") {
    return `${formatLoadWatts(row.loadWatts)} W`;
  }

  const rate = row.reading?.rate;
  return `${formatQuantity(rate)} ${rateUnitForDevice(row.device)}`;
}

function gaugeMaxForUtility(utilityType: UtilityType) {
  switch (utilityType) {
    case "GAS":
      return 3;
    case "WATER":
      return 2;
    case "HEATING":
    case "COOLING":
      return 8;
    default:
      return 5;
  }
}

function toBillingChartPoints(rows: DeviceRow[], language: DashboardController["language"]): BillingChartPoint[] {
  const grouped = new Map<UtilityType, BillingChartPoint>();

  for (const row of rows) {
    const existing =
      grouped.get(row.device.utilityType) ??
      ({
        utilityType: row.device.utilityType,
        label: localizedUtilityTypeLabel(language, row.device.utilityType),
        estimatedCost: 0,
        consumption: 0,
        devices: 0,
      } satisfies BillingChartPoint);

    existing.devices += 1;
    existing.consumption += row.latestConsumption ?? 0;
    existing.estimatedCost += row.latestConsumption !== null ? row.latestConsumption * row.device.tariffPerUnit : 0;
    grouped.set(row.device.utilityType, existing);
  }

  return [...grouped.values()].sort((first, second) => second.estimatedCost - first.estimatedCost);
}

function toDeviceCostRanking(rows: DeviceRow[]) {
  return rows
    .map((row) => ({
      ...row,
      estimatedCost: row.latestConsumption !== null ? row.latestConsumption * row.device.tariffPerUnit : 0,
    }))
    .sort((first, second) => second.estimatedCost - first.estimatedCost)
    .slice(0, 5);
}

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
    deviceRows,
    handleSelectDevice,
    streamStatus,
  } = controller;
  const [homeMode, setHomeMode] = useState<HomeMode>("summary");
  const tr = (phrase: string) => translateText(controller.language, phrase);

  const utilityChartPoints = useMemo(() => toUtilityChartPoints(controller), [controller]);
  const topConsumerPoints = useMemo(() => toTopConsumerPoints(deviceRows), [deviceRows]);

  return (
    <div className="space-y-6">
      <Panel className="p-4">
        <SectionHeader
          eyebrow={tr("Home")}
          title={tr("Fleet Overview")}
          subtitle={tr("Operational health, live telemetry, and utility cost distribution.")}
          action={
            <div className="grid w-full grid-cols-2 rounded-full bg-surface-container-low p-1 md:w-auto">
              {HOME_MODE_OPTIONS.map((option) => (
                <SegmentedButton
                  key={option.value}
                  isSelected={homeMode === option.value}
                  onClick={() => setHomeMode(option.value)}
                >
                  <UIIcon name={option.icon} className="text-[15px]" filled={homeMode === option.value} />
                  {tr(option.label)}
                </SegmentedButton>
              ))}
            </div>
          }
        />
      </Panel>

      {homeMode === "map" ? (
        <HomeMapPanel controller={controller} />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label={tr("Fleet Devices")} value={devices.length} detail={`${activeDeviceCount} ${tr("active devices")}`} icon="router" />
            <KpiCard
              label={tr("Utility Categories")}
              value={fleetSummary?.totals.utilityCategoryCount ?? 0}
              detail={tr("Electricity, water, gas, heating, cooling")}
              icon="dashboard"
              tone="neutral"
            />
            <KpiCard
              label={tr("Fleet Cost (30d)")}
              value={formatCurrency(fleetSummary?.totals.monthEstimatedCost)}
              detail={`${tr("Today")}: ${formatCurrency(fleetSummary?.totals.todayEstimatedCost)}`}
              icon="payments"
            />
            <KpiCard
              label={tr("Fleet Health")}
              value={`${fleetHealthPercent}%`}
              detail={`${errorCount} critical | Stream: ${streamStatus}`}
              icon="monitor_heart"
              tone={errorCount > 0 ? "warning" : "success"}
            />
          </section>

          {fleetSummaryLoading ? (
            <Panel className="text-sm text-on-surface-variant">Loading category summary...</Panel>
          ) : null}

          {fleetSummaryError ? <Panel className="bg-error/10 text-sm text-error">{fleetSummaryError}</Panel> : null}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Panel className="xl:col-span-7">
              <SectionHeader
                title={tr("Utility Consumption")}
                subtitle={tr("Aggregated consumption for today, week, and the last 30 days.")}
                eyebrow={tr("Today / Week / 30d")}
              />
              <div className="mt-5">
                <UtilityConsumptionChart
                  data={utilityChartPoints}
                  periodLabels={{
                    today: tr("Today"),
                    week: tr("Week"),
                    month: tr("30d"),
                  }}
                />
              </div>
            </Panel>

            <Panel className="xl:col-span-5">
              <SectionHeader title={tr("Cost Mix")} subtitle={tr("30-day estimated cost by utility category.")} eyebrow={tr("Fleet cost")} />
              <div className="mt-4">
                <FleetCostDonut data={utilityChartPoints} />
              </div>
            </Panel>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Panel className="xl:col-span-7">
              <SectionHeader title={tr("Live Snapshot")} subtitle={tr("Current usage and cost across each utility.")} eyebrow={tr("Stream")} />
              {liveByCategory.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-lg border border-outline-variant/20">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                      <tr>
                        <th className="px-4 py-3">{tr("Utility")}</th>
                        <th className="px-4 py-3">{tr("Devices")}</th>
                        <th className="px-4 py-3">{tr("Latest")}</th>
                        <th className="px-4 py-3">{tr("Cost")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveByCategory.map((category) => (
                        <tr key={`live-${category.utilityType}-${category.unitLabel}`} className="border-t border-outline-variant/15">
                          <td className="px-4 py-3">
                            <UtilityChip utilityType={category.utilityType} language={controller.language} />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{category.deviceCount}</td>
                          <td className="px-4 py-3">
                            <QuantityWithUnit value={category.latestConsumption} unit={category.unitLabel} />
                          </td>
                          <td className="px-4 py-3 font-mono">{formatCurrency(category.liveEstimatedCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                  {tr("Waiting for live telemetry to build category snapshot.")}
                </p>
              )}
            </Panel>

            <Panel className="xl:col-span-5">
              <SectionHeader title={tr("Recent Alerts")} subtitle={tr("Live operational notices and stream state.")} eyebrow={tr("Live")} />
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
                    {tr("No active alerts. Stream heartbeat is stable.")}
                  </p>
                )}
              </div>
            </Panel>
          </section>

          <Panel>
            <SectionHeader title={tr("Top Devices By Latest Usage")} subtitle={tr("Fast ranking of the current highest consumers.")} eyebrow={tr("Live ranking")} />
            <div className="mt-5">
              <TopConsumersChart data={topConsumerPoints} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {topConsumerPoints.slice(0, 4).map((point) => (
                <button
                  type="button"
                  key={point.devEui}
                  className="rounded-lg bg-surface-container-low px-4 py-3 text-left transition hover:bg-surface-container-highest"
                  onClick={() => handleSelectDevice(point.devEui, "meter")}
                >
                  <p className="text-sm font-semibold">{point.name}</p>
                  <p className="mt-1 font-mono text-xs text-on-surface-variant">{point.devEui}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <UtilityChip utilityType={point.utilityType} language={controller.language} />
                    <QuantityWithUnit value={point.value} unit={point.unitLabel} valueClassName="text-lg font-bold" />
                  </div>
                </button>
              ))}
            </div>
          </Panel>
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
    claimCode,
    claimSubmitting,
    claimError,
    claimSuccess,
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
    setClaimCode,
    setClaimError,
    setClaimSuccess,
    setStatusFilter,
    handleSelectDevice,
    setShowCreateDevice,
    handleCreateDevice,
    setCreateForm,
    setEditForm,
    handleStartEditDevice,
    handleCancelEditDevice,
    handleClaimDevices,
    handleEditDevice,
  } = controller;
  const [claimOpen, setClaimOpen] = useState(false);
  const canClaimDevices = controller.user?.role === "CUSTOMER";
  const shouldShowClaim = canClaimDevices && (claimOpen || Boolean(claimError || claimSuccess));
  const [devicePage, setDevicePage] = useState(1);
  const deviceTotalPages = getTotalPages(filteredDeviceRows.length, DEVICE_PAGE_SIZE);
  const currentDevicePage = getCurrentPage(devicePage, deviceTotalPages);
  const paginatedDeviceRows = useMemo(
    () => getPageWindow(filteredDeviceRows, currentDevicePage, DEVICE_PAGE_SIZE),
    [currentDevicePage, filteredDeviceRows],
  );
  const tr = (phrase: string) => translateText(controller.language, phrase);
  const isCompanyCustomer = controller.user?.customerType === "COMPANY";
  const claimLabel = isCompanyCustomer ? tr("Company Claim Code") : tr("Individual Claim Code");
  const claimHelpText = isCompanyCustomer
    ? tr("Use the company claim code to link the prepared fleet devices to this account.")
    : tr("Use an individual claim code to link personal or household meters to this account.");
  const claimPlaceholder = isCompanyCustomer ? "COMPANY-DEMO-2026" : "USER1-DEMO-2026";
  const claimSubmitLabel = isCompanyCustomer ? tr("Claim Fleet Devices") : tr("Claim Personal Devices");

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label={tr("Total Fleet")} value={devices.length} detail="Devices linked to this account" icon="router" />
        <KpiCard label={tr("Connected")} value={connectedCount} detail={tr("Live telemetry received recently")} icon="wifi_tethering" tone="success" />
        <KpiCard label="Critical Errors" value={errorCount} detail="Devices with stale or failed telemetry" icon="warning" tone={errorCount > 0 ? "warning" : "neutral"} />
      </section>

      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader
            title={tr("Device Inventory")}
            subtitle={tr("Search, filter, claim, and maintain your utility meters.")}
            eyebrow={`${filteredDeviceRows.length} visible`}
          />
          <div className="flex flex-wrap items-center gap-2">
            {canClaimDevices ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-[#1a1766]"
                onClick={() => setClaimOpen((previous) => !previous)}
              >
                <UIIcon name="key" className="text-[14px]" />
                {tr("Claim")}
              </button>
            ) : null}
            <button
              type="button"
              className="primary-gradient-bg inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90"
              onClick={() => setShowCreateDevice(true)}
            >
              <UIIcon name="add" className="text-[14px]" />
              {tr("Add Device")}
            </button>
          </div>
        </div>

        {shouldShowClaim ? (
          <form className="mt-5 rounded-lg bg-surface-container-low p-4" onSubmit={handleClaimDevices}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="block flex-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">{claimLabel}</span>
                <input
                  className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 font-mono text-sm uppercase outline-none transition focus:border-primary"
                  placeholder={claimPlaceholder}
                  value={claimCode}
                  onChange={(event) => {
                    setClaimCode(event.target.value);
                    setClaimError(null);
                    setClaimSuccess(null);
                  }}
                  required
                />
                <span className="mt-2 block text-xs text-on-surface-variant">{claimHelpText}</span>
              </label>
              <button
                type="submit"
                className="primary-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={claimSubmitting}
              >
                <UIIcon name="add_box" className="text-[16px]" />
                {claimSubmitting ? tr("Claiming...") : claimSubmitLabel}
              </button>
            </div>
            {claimError ? <p className="mt-3 text-sm text-error">{claimError}</p> : null}
            {claimSuccess ? <p className="mt-3 text-sm text-tertiary">{claimSuccess}</p> : null}
          </form>
        ) : null}

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <UIIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
            <input
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 pl-11 text-sm outline-none transition focus:border-primary"
              placeholder={tr("Search by devEui or device name")}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setDevicePage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                  statusFilter === value
                    ? "bg-primary text-[#1a1766]"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
                }`}
                onClick={() => {
                  setStatusFilter(value);
                  setDevicePage(1);
                }}
              >
                {tr(value === "all" ? "All" : statusLabel(value))}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-lg border border-outline-variant/20 md:block">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-surface-container-low text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">{tr("Device")}</th>
                <th className="px-4 py-3">{tr("Utility")}</th>
                <th className="px-4 py-3">{tr("Tariff")}</th>
                <th className="px-4 py-3">{tr("Status")}</th>
                <th className="px-4 py-3">{tr("Last Seen")}</th>
                <th className="px-4 py-3 text-right">{tr("Rate")}</th>
                <th className="px-4 py-3 text-right">{tr("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeviceRows.map((row) => (
                <tr key={row.device.id} className="border-t border-outline-variant/15 text-sm hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{row.device.name}</p>
                    <p className="mt-1 font-mono text-xs text-on-surface-variant">{row.device.devEui}</p>
                  </td>
                  <td className="px-4 py-3">
                    <UtilityChip utilityType={row.device.utilityType} language={controller.language} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                    {formatCurrency(row.device.tariffPerUnit)} / {row.device.unitLabel}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={row.status} language={controller.language} />
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{row.lastSeen}</td>
                  <td className="px-4 py-3 text-right font-mono">{deviceRateDisplay(row)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        title="Open meter details"
                        aria-label={`Open details for ${row.device.name}`}
                        className="inline-flex rounded-full bg-surface-container-highest p-2 text-primary transition hover:bg-primary hover:text-[#1a1766]"
                        onClick={() => handleSelectDevice(row.device.devEui, "meter")}
                      >
                        <UIIcon name="visibility" className="text-[15px]" />
                      </button>
                      <button
                        type="button"
                        title="Edit device"
                        aria-label={`Edit ${row.device.name}`}
                        className="inline-flex rounded-full bg-surface-container-highest p-2 text-on-surface transition hover:bg-surface-container"
                        onClick={() => handleStartEditDevice(row.device)}
                      >
                        <UIIcon name="edit" className="text-[15px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:hidden">
          {paginatedDeviceRows.map((row) => (
            <article key={`mobile-${row.device.id}`} className="rounded-lg bg-surface-container-low p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.device.name}</p>
                  <p className="mt-1 font-mono text-xs text-on-surface-variant">{row.device.devEui}</p>
                </div>
                <StatusChip status={row.status} language={controller.language} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <UtilityChip utilityType={row.device.utilityType} language={controller.language} />
                <span className="rounded-full bg-surface-container px-2.5 py-1 font-mono text-xs text-on-surface-variant">
                  {formatCurrency(row.device.tariffPerUnit)} / {row.device.unitLabel}
                </span>
                <span className="rounded-full bg-surface-container px-2.5 py-1 font-mono text-xs text-on-surface-variant">
                  {deviceRateDisplay(row)}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#1a1766]"
                  onClick={() => handleSelectDevice(row.device.devEui, "meter")}
                >
                  <UIIcon name="visibility" className="text-[14px]" />
                  Details
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-surface-container-highest p-2 text-on-surface"
                  onClick={() => handleStartEditDevice(row.device)}
                  aria-label={`Edit ${row.device.name}`}
                >
                  <UIIcon name="edit" className="text-[15px]" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredDeviceRows.length === 0 ? (
          <p className="mt-4 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            No devices matched your filters.
          </p>
        ) : null}

        <PaginationControls
          page={currentDevicePage}
          totalPages={deviceTotalPages}
          totalItems={filteredDeviceRows.length}
          pageSize={DEVICE_PAGE_SIZE}
          onPageChange={setDevicePage}
        />
      </Panel>

      {showCreateDevice ? (
        <DeviceFormModal
          title={tr("Register New Device")}
          language={controller.language}
          mode="create"
          form={createForm}
          error={createError}
          submitting={createSubmitting}
          onSubmit={handleCreateDevice}
          onClose={() => setShowCreateDevice(false)}
          setForm={setCreateForm}
        />
      ) : null}

      {editingDevEui ? (
        <DeviceFormModal
          title={tr("Edit Device")}
          language={controller.language}
          mode="edit"
          form={editForm}
          devEui={editingDevEui}
          error={editError}
          submitting={editSubmitting}
          onSubmit={handleEditDevice}
          onClose={handleCancelEditDevice}
          setForm={setEditForm}
        />
      ) : null}
    </div>
  );
}

function DeviceFormModal<TForm extends CreateDeviceFormState | UpdateDeviceFormState>({
  title,
  language,
  mode,
  form,
  devEui,
  error,
  submitting,
  onSubmit,
  onClose,
  setForm,
}: {
  title: string;
  language: DashboardController["language"];
  mode: "create" | "edit";
  form: TForm;
  devEui?: string;
  error: string | null;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  setForm: Dispatch<SetStateAction<TForm>>;
}) {
  const tr = (phrase: string) => translateText(language, phrase);
  const setField = <K extends keyof TForm>(key: K, value: TForm[K]) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-surface/70 px-3 py-4 backdrop-blur-sm md:items-center md:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${mode}-device-dialog-title`}
    >
      <form
        className="max-h-[92vh] w-full overflow-y-auto rounded-lg bg-surface-container-high p-5 shadow-2xl md:max-w-2xl md:p-6"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{mode === "create" ? tr("New meter") : devEui}</p>
            <h3 id={`${mode}-device-dialog-title`} className="mt-1 text-2xl font-bold">{title}</h3>
          </div>
          <button
            type="button"
            className="rounded-full bg-surface-container-highest px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant"
            onClick={onClose}
            disabled={submitting}
          >
            {tr("Close")}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mode === "create" && "devEui" in form ? (
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">devEui</span>
              <input
                className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 font-mono text-sm outline-none transition focus:border-primary"
                placeholder="a840410000000000"
                value={form.devEui}
                onChange={(event) => setForm((previous) => ({ ...previous, devEui: event.target.value }))}
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">{tr("Device Name")}</span>
            <input
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="Main Chiller Plant"
              value={form.name}
              onChange={(event) => setField("name", event.target.value as TForm["name"])}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">{tr("Utility Type")}</span>
            <select
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
              value={form.utilityType}
              onChange={(event) =>
                setForm((previous) => {
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
                <option key={`${mode}-utility-${utilityType}`} value={utilityType}>
                  {localizedUtilityTypeLabel(language, utilityType)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Tariff (USD/{form.unitLabel || "unit"})
            </span>
            <input
              type="number"
              min="0"
              step="0.0001"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
              value={form.tariffPerUnit}
              onChange={(event) => setField("tariffPerUnit", event.target.value as TForm["tariffPerUnit"])}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">Unit Label</span>
            <input
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
              value={form.unitLabel}
              onChange={(event) => setField("unitLabel", event.target.value as TForm["unitLabel"])}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">Latitude</span>
            <input
              type="number"
              min="-90"
              max="90"
              step="0.000001"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="44.4268"
              value={form.latitude}
              onChange={(event) => setField("latitude", event.target.value as TForm["latitude"])}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">Longitude</span>
            <input
              type="number"
              min="-180"
              max="180"
              step="0.000001"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="26.1025"
              value={form.longitude}
              onChange={(event) => setField("longitude", event.target.value as TForm["longitude"])}
            />
          </label>

          <label className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setField("isActive", event.target.checked as TForm["isActive"])}
            />
            Mark device as active
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="primary-gradient-bg inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            <UIIcon name={mode === "create" ? "add" : "edit"} className="text-[16px]" />
            {submitting ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create Device" : "Save Changes"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function HomeMapPanel({ controller }: ViewProps) {
  const {
    devices,
    deviceRows,
    devicesLoading,
    selectedDevEui,
    handleSelectDevice,
    setShowCreateDevice,
    setActiveViewWithRoute,
  } = controller;
  const [utilityFilter, setUtilityFilter] = useState<MapUtilityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchOpen, setMapSearchOpen] = useState(false);
  const mapSearchRef = useRef<HTMLDivElement | null>(null);
  const tr = (phrase: string) => translateText(controller.language, phrase);

  useEffect(() => {
    if (!mapSearchOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && mapSearchRef.current?.contains(target)) {
        return;
      }

      setMapSearchOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mapSearchOpen]);

  const mapRows = useMemo(
    () => {
      const normalizedSearch = mapSearchQuery.trim().toLowerCase();

      return deviceRows.filter((row) => {
        const hasCoordinates = typeof row.device.latitude === "number" && typeof row.device.longitude === "number";
        const matchesUtility = utilityFilter === "all" || row.device.utilityType === utilityFilter;
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          row.device.name.toLowerCase().includes(normalizedSearch) ||
          row.device.devEui.toLowerCase().includes(normalizedSearch);

        return hasCoordinates && matchesUtility && matchesStatus && matchesSearch;
      });
    },
    [deviceRows, mapSearchQuery, statusFilter, utilityFilter],
  );
  const mapDevices = useMemo(
    () => mapRows.map((row) => row.device as typeof row.device & { latitude: number; longitude: number }),
    [mapRows],
  );
  const selectedMappedDevice = mapDevices.find((device) => device.devEui === selectedDevEui) ?? null;
  const groupedByUtility = useMemo(
    () =>
      UTILITY_TYPES.map((utilityType) => ({
        utilityType,
        rows: mapRows.filter((row) => row.device.utilityType === utilityType),
      })).filter((group) => group.rows.length > 0),
    [mapRows],
  );
  const filtersAreActive = utilityFilter !== "all" || statusFilter !== "all" || mapSearchQuery.trim().length > 0;

  if (devicesLoading && devices.length === 0) {
    return (
      <div className="space-y-4">
        <Panel className="text-sm text-on-surface-variant">Loading device locations...</Panel>
        <MapCanvasSkeleton />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <Panel className="text-sm text-on-surface-variant">
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
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel className="min-w-0">
        {mapDevices.length > 0 ? (
          <DeviceMapCanvas
            devices={mapDevices}
            selectedDevEui={selectedDevEui}
            onSelectDevice={(devEui) => handleSelectDevice(devEui, "overview")}
            defaultCenter={[47.646, 23.548]}
            defaultZoom={14}
          />
        ) : (
          <div className="flex h-[clamp(540px,calc(100vh-290px),790px)] min-h-[540px] items-center justify-center rounded-lg bg-surface-container-low px-6 text-center text-sm text-on-surface-variant">
            No mapped devices match the selected filters.
          </div>
        )}
      </Panel>

      <aside className="flex min-h-[540px] flex-col rounded-lg bg-surface-container-high p-4 xl:h-[clamp(588px,calc(100vh-242px),838px)]">
        <SectionHeader title={tr("Map Selection")} subtitle={`${mapDevices.length} ${tr("mapped device(s)")}`} />

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              {tr("Utility")}
            </span>
            <select
              className="min-h-10 w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 text-xs font-bold uppercase tracking-[0.06em] outline-none transition focus:border-primary"
              value={utilityFilter}
              onChange={(event) => setUtilityFilter(event.target.value as MapUtilityFilter)}
            >
              <option value="all">{tr("All")}</option>
              {UTILITY_TYPES.map((utilityType) => (
                <option key={`map-utility-option-${utilityType}`} value={utilityType}>
                  {localizedUtilityTypeLabel(controller.language, utilityType)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              {tr("Status")}
            </span>
            <select
              className="min-h-10 w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 text-xs font-bold uppercase tracking-[0.06em] outline-none transition focus:border-primary"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof STATUS_FILTERS)[number])}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={`map-status-option-${status}`} value={status}>
                  {status === "all" ? tr("All") : tr(statusLabel(status))}
                </option>
              ))}
            </select>
          </label>

          <div ref={mapSearchRef} className="contents">
            <div className="block">
              <span className="mb-1.5 block select-none text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-transparent">
                Search
              </span>
              <button
                type="button"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/25 transition ${
                  mapSearchQuery.trim().length > 0
                    ? "bg-primary text-[#1a1766]"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest hover:text-primary"
                }`}
                aria-label={tr("Search map devices")}
                title={tr("Search map devices")}
                onClick={() => setMapSearchOpen((isOpen) => !isOpen)}
              >
                <UIIcon name="search" className="text-[15px]" />
              </button>
            </div>

            {mapSearchOpen ? (
              <div className="relative col-span-3">
                <UIIcon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
                />
                <input
                  autoFocus
                  className="min-h-10 w-full rounded-lg border border-primary bg-surface-container-low py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-on-surface-variant"
                  placeholder={tr("Search map devices")}
                  value={mapSearchQuery}
                  onChange={(event) => setMapSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setMapSearchOpen(false);
                      event.currentTarget.blur();
                    }
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        {filtersAreActive ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-surface-container-highest px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-[#1a1766]"
              onClick={() => {
                setUtilityFilter("all");
                setStatusFilter("all");
                setMapSearchQuery("");
                setMapSearchOpen(false);
              }}
            >
              {tr("Reset")}
            </button>
          </div>
        ) : null}

        {selectedMappedDevice ? (
          <article className="mt-4 rounded-lg bg-surface-container-low p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{selectedMappedDevice.name}</p>
                <p className="mt-1 truncate font-mono text-[0.6875rem] text-on-surface-variant">{selectedMappedDevice.devEui}</p>
              </div>
              <UtilityChip utilityType={selectedMappedDevice.utilityType} language={controller.language} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-on-surface-variant">
                {selectedMappedDevice.latitude.toFixed(5)}, {selectedMappedDevice.longitude.toFixed(5)}
              </p>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-[#1a1766]"
                onClick={() => handleSelectDevice(selectedMappedDevice.devEui, "meter")}
              >
                <UIIcon name="visibility" className="text-[14px]" />
                {tr("Open Meter")}
              </button>
            </div>
          </article>
        ) : null}

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {groupedByUtility.map((group) => (
            <div key={`map-group-${group.utilityType}`}>
              <p className="sticky top-0 z-10 mb-2 rounded bg-surface-container-high py-1 text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                {localizedUtilityTypeLabel(controller.language, group.utilityType)} ({group.rows.length})
              </p>
              <div className="space-y-2">
                {group.rows.map((row) => {
                  const isSelected = row.device.devEui === selectedDevEui;
                  return (
                    <button
                      key={`map-list-${row.device.id}`}
                      type="button"
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-primary text-[#1a1766]"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container-highest"
                      }`}
                      onClick={() => handleSelectDevice(row.device.devEui, "overview")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{row.device.name}</p>
                        <StatusChip status={row.status} language={controller.language} />
                      </div>
                      <p className={`mt-1 font-mono text-xs ${isSelected ? "text-[#1a1766]/80" : "text-on-surface-variant"}`}>
                        {row.device.latitude?.toFixed(4)}, {row.device.longitude?.toFixed(4)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function MeterView({ controller }: ViewProps) {
  const {
    devices,
    selectedDevice,
    selectedDeviceRow,
    selectedDataLoading,
    selectedDataError,
    selectedLatest,
    streamStatus,
    lastHeartbeatAt,
    selectedCosts,
    selectedForecast,
    selectedForecastError,
    selectedReadings,
    currentLoadKw,
    currentConsumption,
    handleSelectDevice,
  } = controller;
  const tr = (phrase: string) => translateText(controller.language, phrase);
  const meterSeries = useMemo(() => toMeterSeries(selectedReadings), [selectedReadings]);
  const forecastSeries = useMemo(() => toForecastSeries(selectedForecast), [selectedForecast]);
  const forecastMessage = forecastStatusMessage(selectedForecast, selectedForecastError);
  const arimaOrder = selectedForecast?.model.order ? `(${selectedForecast.model.order.join(", ")})` : "--";

  if (!selectedDevice) {
    return <Panel className="text-sm text-on-surface-variant">{tr("Select or register a device to open meter details.")}</Panel>;
  }

  const isElectricMeter = selectedDevice.utilityType === "ELECTRICITY";
  const currentRate = selectedLatest?.rate ?? latestConsumptionRate(selectedReadings, selectedLatest);
  const liveMetricValue = isElectricMeter ? currentLoadKw : currentRate;
  const liveMetricUnit = isElectricMeter ? "kW" : rateUnitForDevice(selectedDevice);
  const liveMetricLabel = isElectricMeter ? tr("Load") : tr(rateLabelForUtility(selectedDevice.utilityType));
  const gaugeProgress = isElectricMeter
    ? clamp((currentLoadKw ?? 0) / 6, 0, 1)
    : clamp((currentRate ?? 0) / gaugeMaxForUtility(selectedDevice.utilityType), 0, 1);

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <SectionHeader
            eyebrow={`Device | ${selectedDevice.devEui}`}
            title={selectedDevice.name}
            subtitle={`${localizedUtilityTypeLabel(controller.language, selectedDevice.utilityType)} | ${formatCurrency(selectedDevice.tariffPerUnit)} / ${selectedDevice.unitLabel}`}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className="min-h-11 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 text-sm outline-none transition focus:border-primary"
              value={selectedDevice.devEui}
              onChange={(event) => handleSelectDevice(event.target.value, "meter")}
            >
              {devices.map((device) => (
                <option key={`meter-switch-${device.devEui}`} value={device.devEui}>
                  {device.name}
                </option>
              ))}
            </select>
            <StatusChip status={selectedDeviceRow?.status ?? "heartbeat"} language={controller.language} />
          </div>
        </div>
      </Panel>

      {selectedDataError ? <Panel className="bg-error/10 text-sm text-error">{selectedDataError}</Panel> : null}
      {selectedDataLoading ? (
        <Panel className="text-sm text-on-surface-variant">{tr("Refreshing selected meter data...")}</Panel>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionHeader title={tr("Live Readings")} eyebrow={tr("Current meter state")} />

          <div className="mt-5 rounded-lg bg-surface-container-low p-5">
            <div className="relative mx-auto h-44 w-60 overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 220 150">
                <path d="M20 125 A90 90 0 0 1 200 125" stroke="#2d3449" strokeWidth="18" fill="none" strokeLinecap="round" />
                <path
                  d="M20 125 A90 90 0 0 1 200 125"
                  stroke={utilityColor(selectedDevice.utilityType)}
                  strokeWidth="18"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - 283 * gaugeProgress}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                <p className="text-4xl font-black tracking-tight">{liveMetricValue !== null ? liveMetricValue.toFixed(2) : "--"}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">
                  {liveMetricUnit} {liveMetricLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <ReadingTile label={tr("Consumption")} value={formatQuantity(currentConsumption)} unit={selectedDevice.unitLabel} />
              {isElectricMeter ? (
                <>
                  <ReadingTile label={tr("Voltage")} value={selectedLatest?.voltage?.toFixed(1) ?? "--"} unit="V" />
                  <ReadingTile label={tr("Current")} value={selectedLatest?.current?.toFixed(1) ?? "--"} unit="A" />
                </>
              ) : (
                <>
                  <ReadingTile label={tr(rateLabelForUtility(selectedDevice.utilityType))} value={formatQuantity(currentRate)} unit={liveMetricUnit} />
                  <ReadingTile label={tr("Last Seen")} value={formatRelativeTime(selectedLatest?.timestamp, controller.language)} unit="" />
                </>
              )}
            </div>
          </div>
        </Panel>

        <div className="space-y-6 xl:col-span-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Panel className="md:col-span-1">
              <p className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                <UIIcon name="wifi_tethering" className="text-[15px]" />
                {tr("Stream Health")}
              </p>
              <p className="mt-3 text-lg font-semibold text-tertiary">{streamStatus === "open" ? tr("Excellent") : streamStatus}</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {tr("Heartbeat")}: {lastHeartbeatAt ? formatRelativeTime(lastHeartbeatAt, controller.language) : "--"}
              </p>
            </Panel>

            <Panel className="md:col-span-2">
              <p className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                <UIIcon name="payments" className="text-[15px]" />
                {tr("Cost Estimation")}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <CostTile label={tr("Today")} cost={selectedCosts.today?.estimatedCost} units={selectedCosts.today?.consumedUnits} unitLabel={selectedDevice.unitLabel} />
                <CostTile label={tr("This Week")} cost={selectedCosts.week?.estimatedCost} units={selectedCosts.week?.consumedUnits} unitLabel={selectedDevice.unitLabel} />
                <CostTile label={tr("This Month")} cost={selectedCosts.month?.estimatedCost} units={selectedCosts.month?.consumedUnits} unitLabel={selectedDevice.unitLabel} highlight />
              </div>
            </Panel>
          </div>

          <Panel>
            <SectionHeader title={tr("Consumption Profile")} subtitle={tr("Daily aggregated consumption for the selected meter.")} eyebrow={tr("30-day daily totals")} />
            <div className="mt-5 rounded-lg bg-surface-container-low p-3">
              <MeterAreaChart data={meterSeries} unitLabel={`${selectedDevice.unitLabel}/day`} />
            </div>
          </Panel>
        </div>

        <Panel className="xl:col-span-12">
          <SectionHeader
            title={tr("ARIMA Forecast")}
            subtitle={tr("Observed interval consumption against the predicted short-term consumption.")}
            eyebrow={tr("Last 72 hours / next 24 hours")}
          />

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <ForecastTile label={tr("Horizon")} value={`${selectedForecast?.query.horizonHours ?? 24}h`} />
            <ForecastTile label={tr("Step")} value={`${selectedForecast?.query.stepHours ?? 3}h`} />
            <ForecastTile label={tr("ARIMA Order")} value={arimaOrder} />
            <ForecastTile
              label={tr("Projected Cost")}
              value={formatCurrency(selectedForecast?.estimate.estimatedCost)}
              detail={
                <QuantityWithUnit
                  value={selectedForecast?.estimate.forecastedDeltaUnits}
                  unit={selectedDevice.unitLabel}
                />
              }
            />
          </div>

          {forecastMessage ? (
            <p className="mt-4 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              {forecastMessage}
            </p>
          ) : null}

          <div className="mt-5 rounded-lg bg-surface-container-low p-3">
            <ForecastComparisonChart data={forecastSeries} unitLabel={`${selectedDevice.unitLabel}/3h`} />
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ReadingTile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg bg-surface-container px-4 py-3">
      <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="mt-1 inline-flex items-baseline gap-1 text-2xl font-bold">
        <span>{value}</span>
        <span className="text-sm font-medium text-on-surface-variant">{unit}</span>
      </p>
    </div>
  );
}

function ForecastTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-surface-container-low px-4 py-3">
      <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold">{value}</p>
      {detail ? <p className="mt-0.5 text-xs text-on-surface-variant">{detail}</p> : null}
    </div>
  );
}

function CostTile({
  label,
  cost,
  units,
  unitLabel,
  highlight = false,
}: {
  label: string;
  cost: number | null | undefined;
  units: number | null | undefined;
  unitLabel: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-container-low px-4 py-3">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? "text-primary" : ""}`}>{formatCurrency(cost)}</p>
      <p className="mt-0.5 text-xs text-on-surface-variant">
        <QuantityWithUnit value={units} unit={unitLabel} />
      </p>
    </div>
  );
}

export function BillingView({ controller }: ViewProps) {
  const { fleetSummary, selectedDataLoading, deviceRows } = controller;
  const tr = (phrase: string) => translateText(controller.language, phrase);
  const billingChartPoints = useMemo(() => toBillingChartPoints(deviceRows, controller.language), [controller.language, deviceRows]);
  const topCostRows = useMemo(() => toDeviceCostRanking(deviceRows), [deviceRows]);
  const [billingPage, setBillingPage] = useState(1);
  const billingTotalPages = getTotalPages(deviceRows.length, BILLING_PAGE_SIZE);
  const currentBillingPage = getCurrentPage(billingPage, billingTotalPages);
  const paginatedBillingRows = useMemo(
    () => getPageWindow(deviceRows, currentBillingPage, BILLING_PAGE_SIZE),
    [currentBillingPage, deviceRows],
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          label={tr("Today")}
          value={formatCurrency(fleetSummary?.totals.todayEstimatedCost)}
          detail={tr("Fleet cost")}
          icon="payments"
        />
        <KpiCard
          label={tr("This Week")}
          value={formatCurrency(fleetSummary?.totals.weekEstimatedCost)}
          detail="Rolling seven-day estimate"
          icon="insights"
        />
        <KpiCard
          label={tr("This Month")}
          value={formatCurrency(fleetSummary?.totals.monthEstimatedCost)}
          detail={`${fleetSummary?.totals.activeDeviceCount ?? 0} ${tr("active devices")}`}
          icon="attach_money"
        />
      </section>

      {selectedDataLoading ? <Panel className="text-sm text-on-surface-variant">Refreshing billing and telemetry summaries...</Panel> : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-8">
          <SectionHeader title={tr("Cost By Utility")} subtitle={tr("Estimated cumulative cost from the latest readings.")} eyebrow={tr("Fleet billing")} />
          <div className="mt-5">
            <BillingUtilityChart data={billingChartPoints} />
          </div>
        </Panel>

        <Panel className="xl:col-span-4">
          <SectionHeader title={tr("Top Cost Drivers")} subtitle={tr("Highest estimated cumulative costs.")} eyebrow={tr("Ranking")} />
          <div className="mt-5 space-y-3">
            {topCostRows.map((row, index) => (
              <article key={`cost-driver-${row.device.id}`} className="rounded-lg bg-surface-container-low px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {index + 1}. {row.device.name}
                    </p>
                    <div className="mt-2">
                      <UtilityChip utilityType={row.device.utilityType} language={controller.language} />
                    </div>
                  </div>
                  <p className="font-mono text-sm font-bold">{formatCurrency(row.estimatedCost)}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel>
        <SectionHeader
          title={tr("Fleet Billing Projection")}
          subtitle={tr("Instant estimate using latest cumulative consumption and configured tariff per unit.")}
          eyebrow={`${deviceRows.length} devices`}
        />

        <div className="mt-5 overflow-hidden rounded-lg border border-outline-variant/20">
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">{tr("Device")}</th>
                  <th className="px-4 py-3">{tr("Utility")}</th>
                  <th className="px-4 py-3">{tr("Tariff")}</th>
                  <th className="px-4 py-3">{tr("Latest")} {tr("Consumption")}</th>
                  <th className="px-4 py-3">{tr("Cost")}</th>
                  <th className="px-4 py-3">{tr("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBillingRows.map((row) => {
                  const cumulativeCost =
                    row.latestConsumption !== null ? row.latestConsumption * row.device.tariffPerUnit : null;

                  return (
                    <tr key={`billing-${row.device.id}`} className="border-t border-outline-variant/15 text-sm hover:bg-surface-container-low">
                      <td className="px-4 py-3 font-semibold">{row.device.name}</td>
                      <td className="px-4 py-3">
                        <UtilityChip utilityType={row.device.utilityType} language={controller.language} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                        {formatCurrency(row.device.tariffPerUnit)} / {row.device.unitLabel}
                      </td>
                      <td className="px-4 py-3">
                        <QuantityWithUnit value={row.latestConsumption} unit={row.device.unitLabel} />
                      </td>
                      <td className="px-4 py-3 font-mono">{formatCurrency(cumulativeCost)}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={row.status} language={controller.language} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
            {paginatedBillingRows.map((row) => {
              const cumulativeCost =
                row.latestConsumption !== null ? row.latestConsumption * row.device.tariffPerUnit : null;
              return (
                <article key={`billing-mobile-${row.device.id}`} className="rounded-lg bg-surface-container-low p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{row.device.name}</p>
                      <div className="mt-2">
                        <UtilityChip utilityType={row.device.utilityType} language={controller.language} />
                      </div>
                    </div>
                    <StatusChip status={row.status} language={controller.language} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">{tr("Usage")}</p>
                      <p className="mt-1">
                        <QuantityWithUnit value={row.latestConsumption} unit={row.device.unitLabel} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">{tr("Cost")}</p>
                      <p className="mt-1 font-mono font-semibold">{formatCurrency(cumulativeCost)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <PaginationControls
          page={currentBillingPage}
          totalPages={billingTotalPages}
          totalItems={deviceRows.length}
          pageSize={BILLING_PAGE_SIZE}
          onPageChange={setBillingPage}
        />
      </Panel>
    </div>
  );
}
