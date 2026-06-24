"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { UtilityType } from "@/lib/utility";

import { formatCurrency, formatQuantity } from "./utils";

export type UtilityChartPoint = {
  utilityType: UtilityType;
  label: string;
  unitLabel: string;
  today: number;
  week: number;
  month: number;
  cost: number;
  devices: number;
  active: number;
};

export type DeviceRankingPoint = {
  name: string;
  devEui: string;
  utilityType: UtilityType;
  value: number;
  unitLabel: string;
};

export type MeterSeriesPoint = {
  timestamp: string;
  label: string;
  consumption: number;
  average: number | null;
};

export type ForecastSeriesPoint = {
  timestamp: string;
  label: string;
  observed: number | null;
  predicted: number | null;
  lower: number | null;
  upper: number | null;
};

export type BillingChartPoint = {
  utilityType: UtilityType;
  label: string;
  estimatedCost: number;
  consumption: number;
  devices: number;
};

const UTILITY_COLORS: Record<UtilityType, string> = {
  ELECTRICITY: "#facc15",
  WATER: "#38bdf8",
  GAS: "#fb923c",
  HEATING: "#f87171",
  COOLING: "#60a5fa",
  OTHER: "#a7f3d0",
};

const GRID_COLOR = "rgba(199, 196, 215, 0.14)";
const AXIS_COLOR = "#c7c4d7";
const PANEL_TEXT = "#dae2fd";
const RESPONSIVE_CHART_PROPS = {
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  initialDimension: { width: 360, height: 260 },
} as const;

export function utilityColor(utilityType: UtilityType) {
  return UTILITY_COLORS[utilityType] ?? "#c0c1ff";
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-56 items-center justify-center rounded-lg bg-surface-container-low px-4 text-center text-sm text-on-surface-variant">
      {label}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: { unitLabel?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs shadow-xl">
      {label ? <p className="mb-1 font-semibold text-on-surface">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <p key={`${item.name}-${item.value}`} className="flex items-center gap-2 text-on-surface-variant">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color ?? "#c0c1ff" }} />
            <span>{item.name}: </span>
            <span className="font-mono text-on-surface">
              {formatQuantity(item.value)}
              {item.payload?.unitLabel ? ` ${item.payload.unitLabel}` : ""}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs shadow-xl">
      {label ? <p className="mb-1 font-semibold text-on-surface">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <p key={`${item.name}-${item.value}`} className="flex items-center gap-2 text-on-surface-variant">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color ?? "#c0c1ff" }} />
            <span>{item.name}: </span>
            <span className="font-mono text-on-surface">{formatCurrency(item.value)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function FleetCostDonut({ data }: { data: UtilityChartPoint[] }) {
  const chartData = data.filter((point) => point.cost > 0);

  if (chartData.length === 0) {
    return <EmptyChart label="No cost data available for the selected period yet." />;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer {...RESPONSIVE_CHART_PROPS}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="cost"
            nameKey="label"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={3}
            stroke="rgba(6,14,32,0.55)"
            strokeWidth={3}
          >
            {chartData.map((point) => (
              <Cell key={`donut-${point.utilityType}`} fill={utilityColor(point.utilityType)} />
            ))}
          </Pie>
          <Tooltip content={<CurrencyTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UtilityConsumptionChart({
  data,
  periodLabels = { today: "Today", week: "Week", month: "30d" },
}: {
  data: UtilityChartPoint[];
  periodLabels?: { today: string; week: string; month: string };
}) {
  if (data.length === 0) {
    return <EmptyChart label="No utility consumption data available yet." />;
  }

  const hasConsumptionData = data.some((point) => point.today > 0 || point.week > 0 || point.month > 0);
  if (!hasConsumptionData) {
    return <EmptyChart label="No consumption delta available for the selected periods yet." />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer {...RESPONSIVE_CHART_PROPS}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
          <Bar dataKey="today" name={periodLabels.today} fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="week" name={periodLabels.week} fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="month" name={periodLabels.month} fill="#c0c1ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopConsumersChart({ data }: { data: DeviceRankingPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart label="Waiting for telemetry to rank devices." />;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer {...RESPONSIVE_CHART_PROPS}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 28, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={116}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name="Latest usage" radius={[0, 6, 6, 0]}>
            {data.map((point) => (
              <Cell key={`top-${point.devEui}`} fill={utilityColor(point.utilityType)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MeterAreaChart({ data, unitLabel }: { data: MeterSeriesPoint[]; unitLabel: string }) {
  if (data.length < 2) {
    return <EmptyChart label="No profile data yet for this device." />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer {...RESPONSIVE_CHART_PROPS}>
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="label"
            minTickGap={28}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-on-surface">{label}</p>
                  <div className="mt-1 space-y-1">
                    {payload.map((item) => {
                      if (item.value === null || item.value === undefined) {
                        return null;
                      }

                      return (
                        <p key={`${item.name}-${item.dataKey}`} className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color ?? "#c0c1ff" }} />
                          <span>{item.name}: </span>
                          <span className="font-mono text-on-surface">
                            {formatQuantity(Number(item.value))} {unitLabel}
                          </span>
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
          <Bar
            dataKey="consumption"
            name="Daily consumption"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="average"
            name="7-day average"
            stroke="#c0c1ff"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4, fill: PANEL_TEXT }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastComparisonChart({ data, unitLabel }: { data: ForecastSeriesPoint[]; unitLabel: string }) {
  const hasForecast = data.some((point) => point.predicted !== null);
  if (data.length < 2 || !hasForecast) {
    return <EmptyChart label="No forecast series available for this device yet." />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer {...RESPONSIVE_CHART_PROPS}>
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastObservedGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          {data.some((point) => point.predicted !== null) ? (
            <ReferenceArea
              x1={data.find((point) => point.predicted !== null)?.label}
              x2={data.at(-1)?.label}
              fill="#c0c1ff"
              fillOpacity={0.08}
              strokeOpacity={0}
            />
          ) : null}
          {data.some((point) => point.predicted !== null) ? (
            <ReferenceLine
              x={data.find((point) => point.predicted !== null)?.label}
              stroke="rgba(218, 226, 253, 0.55)"
              strokeDasharray="3 3"
              label={{ value: "Now", position: "insideTop", fill: AXIS_COLOR, fontSize: 12 }}
            />
          ) : null}
          <XAxis
            dataKey="label"
            minTickGap={28}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-on-surface">{label}</p>
                  <div className="mt-1 space-y-1">
                    {payload.map((item) => {
                      if (item.value === null || item.value === undefined) {
                        return null;
                      }

                      return (
                        <p key={`${item.name}-${item.dataKey}`} className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color ?? "#c0c1ff" }} />
                          <span>{item.name}: </span>
                          <span className="font-mono text-on-surface">
                            {formatQuantity(Number(item.value))} {unitLabel}
                          </span>
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="observed"
            name="Observed"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#forecastObservedGradient)"
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            name="ARIMA forecast"
            stroke="#c0c1ff"
            strokeWidth={3}
            dot={{ r: 3, fill: "#c0c1ff" }}
            activeDot={{ r: 4, fill: PANEL_TEXT }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="lower"
            name="Lower 95%"
            stroke="rgba(192, 193, 255, 0.45)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="upper"
            name="Upper 95%"
            stroke="rgba(192, 193, 255, 0.45)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BillingUtilityChart({ data }: { data: BillingChartPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart label="No billing data available yet." />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer {...RESPONSIVE_CHART_PROPS}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CurrencyTooltip />} />
          <Bar dataKey="estimatedCost" name="Estimated cost" radius={[6, 6, 0, 0]}>
            {data.map((point) => (
              <Cell key={`billing-${point.utilityType}`} fill={utilityColor(point.utilityType)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
