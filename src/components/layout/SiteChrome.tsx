"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import { AudioPlayerBar } from "@/components/player/AudioPlayerBar";

const AUTH_PATHS = new Set(["/login", "/signup"]);

function isStudioRoute(pathname: string) {
  return pathname === "/studio" || pathname.startsWith("/studio/");
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const isStudio = isStudioRoute(pathname);
  const useShell = !isAuthRoute && !isStudio;

  if (!useShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar>
        <div className="flex min-h-full w-full flex-col">
          <main className="relative z-0 w-full flex-1 pb-24">{children}</main>
          <Footer />
        </div>
      </Navbar>
      <AudioPlayerBar inset />
    </>
  );
}
