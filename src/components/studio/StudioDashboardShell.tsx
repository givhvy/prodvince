"use client";

import type { ReactNode } from "react";
import { StudioAstrixApp } from "@/components/studio/StudioAstrixApp";
import { StudioBodyReset } from "@/components/studio/StudioBodyReset";

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
    <>
      <StudioBodyReset />
      <StudioAstrixApp userName={userName} userEmail={userEmail}>
        {children}
      </StudioAstrixApp>
    </>
  );
}
