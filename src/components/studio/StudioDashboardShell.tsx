"use client";

import type { ReactNode } from "react";
import DashboardLayout from "@/components/dashboards/demostack-dashboard/dashboard-layout";
import { ThemeProvider } from "@/components/dashboards/demostack-dashboard/components/demostack/theme-provider";
import "@/components/dashboards/demostack-dashboard/dashboard.css";

type StudioDashboardShellProps = {
  children: ReactNode;
  userName: string;
  userEmail: string;
};

export function StudioDashboardShell({
  children,
  userName,
  userEmail,
}: StudioDashboardShellProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="velta-studio-theme">
      <div className="demostack-dashboard dark min-h-svh bg-background">
        <DashboardLayout userName={userName} userEmail={userEmail}>
          {children}
        </DashboardLayout>
      </div>
    </ThemeProvider>
  );
}
