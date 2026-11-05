import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { StudioDashboardShell } from "@/components/studio/StudioDashboardShell";
import { canAccessStudio, getCurrentUser } from "@/lib/auth";

const astrixSans = Inter({
  subsets: ["latin"],
  variable: "--font-astrix",
  display: "swap",
});

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/studio");
  if (!canAccessStudio(user.role)) redirect("/sell");

  return (
    <div className={`${astrixSans.variable} h-svh overflow-hidden`}>
      <StudioDashboardShell userName={user.name} userEmail={user.email}>
        {children}
      </StudioDashboardShell>
    </div>
  );
}
