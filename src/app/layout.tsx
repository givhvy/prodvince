import "@/styles/globals.css";
import { cn } from "@/lib";
import { heading, subheading } from "@/constants/fonts";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { AppToaster } from "@/components/layout/AppToaster";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Velta: Buy & Sell Beats",
    template: "%s · Velta",
  },
  description: "Beat marketplace with Studio dashboard, email marketing, and live Whop checkout.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-zinc-950 font-heading text-foreground antialiased",
          heading.variable,
          subheading.variable,
        )}
      >
        <PlayerProvider>
          <AppToaster />
          <SiteChrome>{children}</SiteChrome>
        </PlayerProvider>
      </body>
    </html>
  );
}
