"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/watermelon/astrix-dashboard/dashboard-layout";
import { ThemeProvider } from "@/components/watermelon/astrix-dashboard/components/astrix/theme-provider";
import {
  StudioUserProvider,
  studioInitials,
} from "@/components/studio/studio-user-context";
import { NextDashboardNavigationProvider } from "@/components/watermelon/astrix-dashboard/components/astrix/navigation";

const DashboardContent = dynamic(
  () =>
    import("@/components/watermelon/astrix-dashboard/components/astrix/dashboard-content").then(
      (mod) => mod.DashboardContent,
    ),
);
const ClassificationContent = dynamic(
  () =>
    import(
      "@/components/watermelon/astrix-dashboard/components/astrix/classification-content"
    ).then((mod) => mod.ClassificationContent),
);
const ReportsContent = dynamic(
  () =>
    import("@/components/watermelon/astrix-dashboard/components/astrix/reports-content").then(
      (mod) => mod.ReportsContent,
    ),
);

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
    <ThemeProvider defaultTheme="light" storageKey="astrix-theme">
      <NextDashboardNavigationProvider>
        <StudioUserProvider
          user={{
            name: userName,
            email: userEmail,
            initials: studioInitials(userName) || "VB",
          }}
        >
          <DashboardLayout>
            <StudioRouteContent pathname={pathname}>{children}</StudioRouteContent>
          </DashboardLayout>
        </StudioUserProvider>
      </NextDashboardNavigationProvider>
    </ThemeProvider>
  );
}
