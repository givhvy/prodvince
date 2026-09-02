"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/watermelon/astrix-dashboard/dashboard-layout";
import { ClassificationContent } from "@/components/watermelon/astrix-dashboard/components/astrix/classification-content";
import { DashboardContent } from "@/components/watermelon/astrix-dashboard/components/astrix/dashboard-content";
import { ReportsContent } from "@/components/watermelon/astrix-dashboard/components/astrix/reports-content";
import { ThemeProvider } from "@/components/watermelon/astrix-dashboard/components/astrix/theme-provider";
import {
  StudioUserProvider,
  studioInitials,
} from "@/components/studio/studio-user-context";

type StudioAstrixAppProps = {
  children: ReactNode;
  userName: string;
  userEmail: string;
};

function StudioPageWrap({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-8 pb-10 md:px-6">
      {children}
    </div>
  );
}

function StudioRouteContent({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  if (pathname === "/studio") return <DashboardContent />;
  if (pathname === "/studio/beats") return <ClassificationContent />;
  if (pathname === "/studio/marketing") return <ReportsContent />;
  if (pathname === "/studio/compliance" || pathname === "/studio/settings") {
    return null;
  }
  if (pathname === "/studio/payments" || pathname === "/studio/upload") {
    return <StudioPageWrap>{children}</StudioPageWrap>;
  }
  return <StudioPageWrap>{children}</StudioPageWrap>;
}

export function StudioAstrixApp({
  children,
  userName,
  userEmail,
}: StudioAstrixAppProps) {
  const pathname = usePathname();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="velta-studio-theme">
      <StudioUserProvider
        user={{
          name: userName,
          email: userEmail,
          initials: studioInitials(userName) || "VB",
        }}
      >
        <div className="astrix-dashboard dark min-h-svh bg-background text-foreground">
          <DashboardLayout>
            <StudioRouteContent pathname={pathname}>{children}</StudioRouteContent>
          </DashboardLayout>
        </div>
      </StudioUserProvider>
    </ThemeProvider>
  );
}
