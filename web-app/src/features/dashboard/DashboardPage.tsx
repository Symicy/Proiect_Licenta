"use client";

import type { DashboardPageProps } from "./types";
import { useDashboardControllerContext } from "./DashboardControllerContext";
import { BillingView, DevicesView, MeterView, OverviewView } from "./DashboardViews";

function DashboardContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" aria-live="polite" aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-surface-container-high p-6">
          <div className="h-3 w-24 animate-pulse rounded bg-surface-container-highest" />
          <div className="mt-5 h-10 w-28 animate-pulse rounded bg-surface-container-highest" />
          <div className="mt-4 h-2 w-full animate-pulse rounded bg-surface-container-highest" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage({ initialView = "overview" }: DashboardPageProps) {
  const controller = useDashboardControllerContext();
  const activeView = controller.activeView ?? initialView;
  const showInitialSkeleton = controller.devicesLoading && controller.devices.length === 0;

  return (
    <>
      {showInitialSkeleton ? <DashboardContentSkeleton /> : null}

      {controller.devicesLoading && !showInitialSkeleton ? (
        <div className="rounded-xl bg-surface-container p-6 text-sm text-on-surface-variant">
          Loading device inventory...
        </div>
      ) : null}

      {controller.devicesError ? (
        <div className="mb-6 rounded-xl bg-error/10 p-4 text-sm text-error">{controller.devicesError}</div>
      ) : null}

      {!showInitialSkeleton && activeView === "overview" ? <OverviewView controller={controller} /> : null}
      {!showInitialSkeleton && activeView === "devices" ? <DevicesView controller={controller} /> : null}
      {!showInitialSkeleton && activeView === "meter" ? <MeterView controller={controller} /> : null}
      {!showInitialSkeleton && activeView === "billing" ? <BillingView controller={controller} /> : null}
    </>
  );
}
