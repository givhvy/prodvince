"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardNavigation = {
  pathname: string;
  navigate: (pathname: string) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigation | null>(
  null,
);

const DEMO_ROUTE_MAP: Record<string, string> = {
  "/": "/studio",
  "/classification": "/studio/beats",
  "/reports": "/studio/marketing",
  "/integration": "/studio/payments",
  "/compliance": "/studio/upload",
  "/settings": "/studio/settings",
};

function resolveDashboardHref(href: string) {
  return DEMO_ROUTE_MAP[href] ?? href;
}

export function DashboardNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pathname, setPathname] = useState("/");
  const value = useMemo(
    () => ({ pathname, navigate: setPathname }),
    [pathname],
  );

  return (
    <DashboardNavigationContext.Provider value={value}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

export function NextDashboardNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const value = useMemo(
    () => ({
      pathname,
      navigate: (href: string) => router.push(resolveDashboardHref(href)),
    }),
    [pathname, router],
  );

  return (
    <DashboardNavigationContext.Provider value={value}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);

  if (!context) {
    throw new Error(
      "useDashboardNavigation must be used within DashboardNavigationProvider",
    );
  }

  return context;
}

export function DashboardLink({
  href,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useDashboardNavigation();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(href);
  }

  return <a href={href} onClick={handleClick} {...props} />;
}
