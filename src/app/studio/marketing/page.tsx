"use client";

import { useState } from "react";
import { getCampaignsForSeller } from "@/lib/catalog";

const demoCampaigns = getCampaignsForSeller("seller_velta");

export default function StudioMarketingPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function sendCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/marketing/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: String(form.get("subject") ?? ""),
        body: String(form.get("body") ?? ""),
        audience: String(form.get("audience") ?? "followers"),
      }),
    });
    const payload = await response.json();
    setStatus(payload.message ?? (response.ok ? "Campaign sent" : "Failed to send"));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Email marketing</h2>
        <p className="mt-2 text-muted">
          Send beat drops and promo campaigns directly from Studio. Uses Resend when configured.
        </p>
      </div>

      <form
        onSubmit={sendCampaign}
        className="space-y-4 rounded-2xl border border-border bg-card/60 p-6"
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium">Subject</span>
          <input
            name="subject"
            defaultValue="New beat drop this week"
            className="w-full rounded-xl border border-border bg-black/20 px-4 py-3"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Audience</span>
          <select
            name="audience"
            className="w-full rounded-xl border border-border bg-black/20 px-4 py-3"
          >
            <option value="followers">Followers</option>
            <option value="buyers">Past buyers</option>
            <option value="all">All subscribers</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Message</span>
          <textarea
            name="body"
            rows={6}
            defaultValue="3 new beats just dropped. Tap in for first listen."
            className="w-full rounded-xl border border-border bg-black/20 px-4 py-3"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white"
        >
          Send campaign
        </button>
      </form>

      {status ? <p className="text-sm text-accent">{status}</p> : null}

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="text-lg font-semibold">Recent campaigns</h3>
        <div className="mt-4 space-y-3">
          {demoCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-border bg-black/20 px-4 py-3"
            >
              <p className="font-medium">{campaign.subject}</p>
              <p className="text-sm text-muted">
                {campaign.status} · {campaign.audience}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
