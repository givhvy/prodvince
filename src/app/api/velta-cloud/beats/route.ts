import { connection } from "next/server";
import { cloudErrorResponse, listCloudBeats } from "@/lib/velta-cloud";

export const maxDuration = 30;

export async function GET() {
  await connection();
  try {
    return Response.json(await listCloudBeats(), {
      headers: {
        // The same public list for everyone: the edge keeps it briefly and serves a stale copy while
        // it refreshes, so the page doesn't wait on the Velta Cloud index. The browser keeps none.
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Vercel-CDN-Cache-Control": "max-age=15, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return cloudErrorResponse(error);
  }
}
