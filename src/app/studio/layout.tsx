import { redirect } from "next/navigation";
import { StudioDashboardShell } from "@/components/studio/StudioDashboardShell";
import { canAccessStudio, getCurrentUser } from "@/lib/auth";

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/studio");
  if (!canAccessStudio(user.role)) redirect("/sell");

  return (
    <StudioDashboardShell userName={user.name} userEmail={user.email}>
      {children}
    </StudioDashboardShell>
  );
}
