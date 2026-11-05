"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 print:hidden"
    >
      {label}
    </button>
  );
}
