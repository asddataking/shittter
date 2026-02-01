import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { PlaceDetailSignals } from "@/components/PlaceDetailSignals";
import { supabaseServer } from "@/lib/supabase/server";
import type { PlaceDetailResponse } from "@/lib/types";

async function getPlace(id: string): Promise<PlaceDetailResponse | null> {
  const [placeRes, scoreRes, reportsRes] = await Promise.all([
    supabaseServer.from("places").select("*").eq("id", id).single(),
    supabaseServer.from("place_scores").select("*").eq("place_id", id).single(),
    supabaseServer
      .from("reports")
      .select("*")
      .eq("place_id", id)
      .eq("ai_status", "approved")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (placeRes.error || !placeRes.data) return null;
  return {
    place: placeRes.data as PlaceDetailResponse["place"],
    score: scoreRes.data as PlaceDetailResponse["score"],
    reports: (reportsRes.data ?? []) as PlaceDetailResponse["reports"],
  };
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;
  const data = await getPlace(placeId);
  if (!data) notFound();

  const { place, score, reports } = data;
  const trustScore = score?.trust_score ?? 50;
  const summary = score?.summary ?? "No reports yet. Be the first to help the next person.";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link href="/" className="text-sm text-teal-600 hover:underline">
          Back to map
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{place.name}</h1>
        {place.address && (
          <p className="text-sm text-slate-500">{place.address}</p>
        )}
      </header>

      <div className="p-4">
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">TrustScore</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl font-bold text-slate-900">{trustScore}</span>
            <TrustScoreBadge score={trustScore} showNumber={false} />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-medium text-slate-800">Signals</h2>
          <PlaceDetailSignals reports={reports} />
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-medium text-slate-800">What to know</h2>
          <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
            {summary}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-medium text-slate-800">Recent reports</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports yet.</p>
          ) : (
            <ul className="space-y-2">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                >
                  <span className="text-slate-600">
                    Clean {r.cleanliness} · Priv {r.privacy} · Safe {r.safety}
                    {r.has_lock && " · Lock"}
                    {r.has_tp && " · TP"}
                  </span>
                  {r.notes && (
                    <p className="mt-1 text-slate-700">&ldquo;{r.notes}&rdquo;</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          href={`/p/${placeId}/report`}
          className="block rounded bg-teal-600 px-4 py-3 text-center font-medium text-white hover:bg-teal-700"
        >
          Add a report
        </Link>
      </div>
    </main>
  );
}
