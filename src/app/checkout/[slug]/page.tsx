import { notFound, redirect } from "next/navigation";
import { CheckoutClient } from "@/app/checkout/[slug]/CheckoutClient";
import { getCurrentUser } from "@/lib/auth";
import { getBeatBySlug } from "@/lib/catalog";
import type { LicenseTier } from "@/types";

type CheckoutPageProps = PageProps<"/checkout/[slug]">;

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const beat = await getBeatBySlug(slug);
  const user = await getCurrentUser();

  if (!beat) notFound();
  if (beat.exclusiveSold) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Sold exclusively</h1>
        <p className="mt-3 text-muted-foreground">This beat is no longer available to license.</p>
      </div>
    );
  }
  if (!user) redirect(`/login?redirect=/checkout/${slug}?tier=${query.tier ?? "mp3"}`);

  const tier = (query.tier as LicenseTier | undefined) ?? "mp3";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <CheckoutClient beat={beat} tier={tier} userEmail={user.email} />
    </div>
  );
}
