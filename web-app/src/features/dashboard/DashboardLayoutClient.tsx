"use client";

import type { ReactNode } from "react";

import { AuthScreen, BootLoadingScreen, DashboardShell } from "./DashboardUI";
import { DashboardControllerProvider } from "./DashboardControllerContext";
import { useDashboardController } from "./hooks/useDashboardController";

type DashboardLayoutClientProps = {
  children: ReactNode;
};

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const controller = useDashboardController();

  if (controller.bootLoading) {
    return <BootLoadingScreen />;
  }

  if (!controller.user) {
    return <AuthScreen controller={controller} />;
  }

  return (
    <DashboardControllerProvider controller={controller}>
      <DashboardShell controller={controller}>{children}</DashboardShell>
    </DashboardControllerProvider>
  );
}
