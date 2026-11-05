import { cloudErrorResponse, streamBeatAudio } from "@/lib/velta-cloud";

export const maxDuration = 30;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    return await streamBeatAudio(id, request.headers.get("range"));
  } catch (error) {
    return cloudErrorResponse(error);
  }
}
