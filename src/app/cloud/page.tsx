import type { Metadata } from "next";
import { connection } from "next/server";
import { CloudBeats } from "@/components/cloud/CloudBeats";
import Wrapper from "@/components/global/wrapper";
import { isCloudConfigured } from "@/lib/velta-cloud";

export const metadata: Metadata = {
  title: "Velta Cloud",
  robots: { index: false, follow: false },
};

export default async function CloudPage() {
  // The library id is read at request time, so a build without it can't bake in the empty state.
  await connection();

  if (!isCloudConfigured()) {
    return (
      <Wrapper className="py-12 sm:py-16">
        <h1 className="font-heading text-3xl font-medium">Velta Cloud is not set up here</h1>
        <p className="mt-3 max-w-xl text-sm text-zinc-400">This server needs VELTA_CLOUD_LIBRARY_ID.</p>
      </Wrapper>
    );
  }

  return <CloudBeats />;
}
