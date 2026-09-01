"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Compass, CreditCard, LayoutGrid, Music2, User, Users } from "lucide-react";
import { NAV_LINKS } from "@/constants";
import Icons from "../global/icons";
import {
  NotchNav,
  type NotchItemData,
} from "@/components/ui/adaptive-notch-navigation-bar";

const NAV_ICONS: Record<string, NotchItemData["icon"]> = {
  "/explore": Compass,
  "/genres": Music2,
  "/creators": Users,
  "/pricing": CreditCard,
  "/studio": LayoutGrid,
};

const NAV_ITEMS: NotchItemData[] = NAV_LINKS.map((link) => ({
  id: link.href,
  label: link.name,
  icon: NAV_ICONS[link.href],
}));

function resolveActiveId(pathname: string) {
  const match = NAV_ITEMS.find(
    (item) => pathname === item.id || pathname.startsWith(`${item.id}/`),
  );
  if (match) return match.id;
  if (pathname === "/") return "/explore";
  return NAV_ITEMS[0]?.id ?? "/explore";
}

export default function Navbar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeId = resolveActiveId(pathname);

  const logo = (
    <Link href="/" className="flex h-[34px] items-center gap-1.5 sm:gap-2">
      <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800">
        <Icons.icon className="size-4 text-zinc-50" />
      </div>
      <span className="hidden text-xs font-bold tracking-tight text-zinc-950 sm:inline sm:text-sm">
        Velta
      </span>
    </Link>
  );

  const rightContent = (
    <div className="flex h-[34px] items-center gap-1.5 sm:gap-2">
      <Link
        href="/login"
        className="hidden items-center gap-1.5 text-xs font-medium text-zinc-600 outline-none transition-colors hover:text-zinc-900 sm:flex"
      >
        <span className="hidden size-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 sm:flex">
          <User className="size-4" />
        </span>
        Sign in
      </Link>
      <Link
        href="/explore"
        className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-700"
      >
        <span className="hidden sm:inline">Browse beats</span>
        <span className="sm:hidden">Browse</span>
      </Link>
    </div>
  );

  return (
    <NotchNav
      items={NAV_ITEMS}
      activeId={activeId}
      logo={logo}
      rightContent={rightContent}
      onActiveChange={(id) => router.push(id)}
    >
      {children}
    </NotchNav>
  );
}
