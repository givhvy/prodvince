"use client";

import type { ReactNode } from "react";
import { StudioAstrixApp } from "@/components/studio/StudioAstrixApp";

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
    <StudioAstrixApp userName={userName} userEmail={userEmail}>
      {children}
    </StudioAstrixApp>
  );
}
