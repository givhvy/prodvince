import "@/styles/globals.css";
import { cn } from "@/lib";
import { base, heading, subheading } from "@/constants/fonts";
import { Toaster } from "@/components/ui/sonner";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Velta — Buy & Sell Beats",
    template: "%s · Velta",
  },
  description: "Beat marketplace with Studio dashboard, email marketing, and live Whop checkout.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen overflow-hidden bg-zinc-950 font-heading text-foreground antialiased !scrollbar-hide",
          base.variable,
          heading.variable,
          subheading.variable,
        )}
      >
        <PlayerProvider>
          <Toaster richColors theme="dark" position="top-right" />
          <SiteChrome>{children}</SiteChrome>
        </PlayerProvider>
      </body>
    </html>
  );
}
