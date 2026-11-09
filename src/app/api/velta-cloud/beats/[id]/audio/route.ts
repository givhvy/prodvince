import { cloudErrorResponse, streamBeatAudio } from "@/lib/velta-cloud";

export const maxDuration = 30;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = new URL(request.url).searchParams.get("v");
    return await streamBeatAudio(id, request.headers.get("range"), token);
  } catch (error) {
    return cloudErrorResponse(error);
  }
}
