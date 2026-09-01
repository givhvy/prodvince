import { NextResponse } from "next/server";
import { buildBeatDropEmail, sendMarketingEmail } from "@/lib/email";
import { canAccessStudio, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessStudio(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const subject = typeof body.subject === "string" ? body.subject : "";
  const message = typeof body.body === "string" ? body.body : "";
  const audience = typeof body.audience === "string" ? body.audience : "followers";

  const recipients =
    audience === "buyers"
      ? ["buyer@demo.local"]
      : audience === "all"
        ? ["buyer@demo.local", "studio@velta.local"]
        : ["buyer@demo.local"];

  const result = await sendMarketingEmail({
    to: recipients,
    subject,
    html: buildBeatDropEmail(subject, `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/explore`) + `<p>${message}</p>`,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json({
    message: `Campaign sent to ${recipients.length} recipients (${audience}).`,
    messageId: result.messageId,
  });
}
