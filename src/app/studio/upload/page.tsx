"use client";

import { useState } from "react";
import { UploadForm } from "@/components/studio/UploadForm";

export default function StudioUploadPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Upload beats</h2>
        <p className="mt-2 text-muted">
          Multi-file upload, metadata, and license tiers — BeatStars-style workflow.
        </p>
      </div>
      <UploadForm
        onSuccess={(beatTitle) =>
          setMessage(`"${beatTitle}" uploaded. Run Whop setup to attach live checkout plans.`)
        }
      />
      {message ? (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      ) : null}
    </div>
  );
}
