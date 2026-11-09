import { beatPicture, cloudErrorResponse } from "@/lib/velta-cloud";

export const maxDuration = 30;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    return await beatPicture(id, new URL(request.url).searchParams.get("v"));
  } catch (error) {
    return cloudErrorResponse(error);
  }
}
