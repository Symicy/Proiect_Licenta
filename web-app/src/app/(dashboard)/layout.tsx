import type { ReactNode } from "react";

import DashboardLayoutClient from "@/features/dashboard/DashboardLayoutClient";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
