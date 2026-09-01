export type EmailSendResult = {
  ok: boolean;
  messageId?: string;
  error?: string;
};

export async function sendMarketingEmail(input: {
  to: string[];
  subject: string;
  html: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      ok: true,
      messageId: `dev_${Date.now()}`,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "Velta Beats <beats@velta.studio>",
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      error:
        typeof payload?.message === "string"
          ? payload.message
          : "Failed to send email",
    };
  }

  return { ok: true, messageId: payload.id };
}

export function buildBeatDropEmail(beatTitle: string, beatUrl: string) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0f0f0f;color:#fff;padding:32px;">
      <h1 style="margin:0 0 12px;font-size:24px;">New beat drop</h1>
      <p style="color:#a1a1aa;margin:0 0 20px;">${beatTitle} is live on the marketplace.</p>
      <a href="${beatUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;">
        Listen &amp; buy
      </a>
    </div>
  `;
}
