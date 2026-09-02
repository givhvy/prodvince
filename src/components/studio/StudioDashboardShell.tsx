"use client";

import type { ReactNode } from "react";
import DashboardLayout from "@/components/watermelon/astrix-dashboard/dashboard-layout";
import { ThemeProvider } from "@/components/watermelon/astrix-dashboard/components/astrix/theme-provider";
import {
  StudioUserProvider,
  studioInitials,
  type StudioUser,
} from "@/components/studio/studio-user-context";

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
  const user: StudioUser = {
    name: userName,
    email: userEmail,
    initials: studioInitials(userName) || "VB",
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="velta-studio-theme">
      <StudioUserProvider user={user}>
        <div className="astrix-dashboard dark min-h-svh bg-background">
          <DashboardLayout>
            <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pt-8 pb-10 md:px-6">
              {children}
            </div>
          </DashboardLayout>
        </div>
      </StudioUserProvider>
    </ThemeProvider>
  );
}
