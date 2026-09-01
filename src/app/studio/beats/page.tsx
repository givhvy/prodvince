import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAllBeats } from "@/lib/catalog";

export default async function StudioBeatsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const beats = getAllBeats().filter((beat) => beat.sellerId === user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Beats</h2>
          <p className="mt-2 text-muted">Manage track metadata, pricing, and licensing tiers.</p>
        </div>
        <Link
          href="/studio/upload"
          className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white"
        >
          Upload beat
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/30 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">BPM</th>
              <th className="px-4 py-3 font-medium">Plays</th>
              <th className="px-4 py-3 font-medium">Whop plans</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {beats.map((beat) => (
              <tr key={beat.id} className="border-t border-border">
                <td className="px-4 py-4 font-medium">{beat.title}</td>
                <td className="px-4 py-4 text-muted">{beat.bpm}</td>
                <td className="px-4 py-4 text-muted">{beat.plays.toLocaleString()}</td>
                <td className="px-4 py-4 text-muted">
                  {beat.licenses.filter((license) => license.whopPlanId).length}/
                  {beat.licenses.length}
                </td>
                <td className="px-4 py-4">
                  <Link href={`/beats/${beat.slug}`} className="text-accent">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
