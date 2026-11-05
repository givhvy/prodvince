import { connection } from "next/server";
import { cloudErrorResponse, listCloudBeats } from "@/lib/velta-cloud";

export const maxDuration = 30;

export async function GET() {
  await connection();
  try {
    return Response.json(await listCloudBeats(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return cloudErrorResponse(error);
  }
}
