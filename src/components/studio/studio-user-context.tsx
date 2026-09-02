"use client";

import { createContext, useContext, type ReactNode } from "react";

export type StudioUser = {
  name: string;
  email: string;
  initials: string;
};

const StudioUserContext = createContext<StudioUser | null>(null);

export function StudioUserProvider({
  user,
  children,
}: {
  user: StudioUser;
  children: ReactNode;
}) {
  return (
    <StudioUserContext.Provider value={user}>{children}</StudioUserContext.Provider>
  );
}

export function useStudioUser() {
  const context = useContext(StudioUserContext);
  if (!context) {
    throw new Error("useStudioUser must be used within StudioUserProvider");
  }
  return context;
}

export function studioInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
