"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/marketing/navbar";

const Footer = dynamic(() => import("@/components/marketing/footer"));
const AudioPlayerBar = dynamic(
  () => import("@/components/player/AudioPlayerBar").then((mod) => mod.AudioPlayerBar),
  { ssr: false },
);

const AUTH_PATHS = new Set(["/login", "/signup"]);

function isStudioRoute(pathname: string) {
  return pathname === "/studio" || pathname.startsWith("/studio/");
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const isStudio = isStudioRoute(pathname);
  const isDaw = pathname === "/daw" || pathname.startsWith("/daw/");
  const useShell = !isAuthRoute && !isStudio;

  if (!useShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar>
        <div className="flex min-h-full w-full flex-col pt-[4.375rem]">
          <main className="relative z-0 w-full flex-1 pb-24">{children}</main>
          {isDaw ? null : <Footer />}
        </div>
      </Navbar>
      {isDaw ? null : <AudioPlayerBar inset />}
    </>
  );
}
