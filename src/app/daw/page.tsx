import Link from "next/link";
import { DawStudio } from "@/components/daw/DawStudio";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { listDawProjects } from "@/lib/daw";

export default async function DawPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Velta Web DAW</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to finish beats in the browser, upload from your phone, and keep the project in the cloud.
        </p>
        <Link href="/login?redirect=/daw">
          <Button variant="blue">Sign in</Button>
        </Link>
      </div>
    );
  }

  const projects = await listDawProjects(user.id);
  return <DawStudio initialProjects={projects} />;
}
