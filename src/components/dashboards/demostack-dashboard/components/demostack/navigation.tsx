"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

export function useDashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return {
    pathname,
    navigate: (href: string) => router.push(href),
  };
}

export function DashboardLink({
  href,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  return children;
}
