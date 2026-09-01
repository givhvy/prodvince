"use client";

import { useState } from "react";

export default function StudioPaymentsPage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function setupWhop() {
    setLoading(true);
    setResult(null);
    const response = await fetch("/api/whop/setup", { method: "POST" });
    const payload = await response.json();
    setLoading(false);
    setResult(payload.message ?? JSON.stringify(payload, null, 2));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Whop payments</h2>
        <p className="mt-2 text-muted">
          Create Whop products, one-time license plans, and checkout configurations for every beat
          tier. Live payments are handled by Whop checkout embed.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="text-lg font-semibold">Setup checklist</h3>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Complete Whop OAuth (`whop auth login --method oauth --format jsonl`)</li>
          <li>Set `WHOP_API_KEY` and `WHOP_ACCOUNT_ID` in `.env.local`</li>
          <li>Run setup to create product + plans for each license tier</li>
          <li>Test checkout from any beat page</li>
        </ol>
        <button
          type="button"
          onClick={setupWhop}
          disabled={loading}
          className="mt-6 rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Setting up Whop…" : "Run Whop setup"}
        </button>
        {result ? (
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-black/30 p-4 text-xs text-muted">
            {result}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
