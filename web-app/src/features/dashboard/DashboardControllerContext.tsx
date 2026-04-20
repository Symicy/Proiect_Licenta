"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { DashboardController } from "./hooks/useDashboardController";

const DashboardControllerContext = createContext<DashboardController | null>(null);

type DashboardControllerProviderProps = {
  controller: DashboardController;
  children: ReactNode;
};

export function DashboardControllerProvider({ controller, children }: DashboardControllerProviderProps) {
  return (
    <DashboardControllerContext.Provider value={controller}>
      {children}
    </DashboardControllerContext.Provider>
  );
}

export function useDashboardControllerContext() {
  const controller = useContext(DashboardControllerContext);
  if (!controller) {
    throw new Error("useDashboardControllerContext must be used within DashboardControllerProvider.");
  }

  return controller;
}
