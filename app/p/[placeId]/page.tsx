import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { PlaceDetailSignals } from "@/components/PlaceDetailSignals";
import { MoodEmoji } from "@/components/MoodEmoji";
import { sql } from "@/lib/db";
import type { PlaceDetailResponse } from "@/lib/types";
import { getMoodFromScore, getTrustLabel } from "@/lib/types";
import { PLACEHOLDER_TOILET_IMAGE } from "@/lib/placeholders";

async function getPlace(id: string): Promise<PlaceDetailResponse | null> {
  const [placeRow] = await sql`select * from places where id = ${id}`;
  if (!placeRow) return null;
  const [scoreRow] = await sql`select * from place_scores where place_id = ${id}`;
  const reportsRows = (await sql`
    select * from reports where place_id = ${id} and ai_status = 'approved'
    order by created_at desc limit 10
  `) as PlaceDetailResponse["reports"];
  const reportIds = reportsRows.map((r) => r.id);
  let photosByReport: Record<string, string[]> = {};
  if (reportIds.length > 0) {
    const photoRows = (await sql`
      select report_id, url from report_photos where report_id = any(${reportIds})
    `) as { report_id: string; url: string }[];
    for (const p of photoRows) {
      if (!photosByReport[p.report_id]) photosByReport[p.report_id] = [];
      photosByReport[p.report_id].push(p.url);
    }
  }
  const reports: PlaceDetailResponse["reports"] = reportsRows.map((r) => ({
    ...r,
    photo_urls: photosByReport[r.id] ?? [],
  }));
  return {
    place: placeRow as PlaceDetailResponse["place"],
    score: (scoreRow as PlaceDetailResponse["score"]) ?? null,
    reports,
  };
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < value ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
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
  const mood = getMoodFromScore(trustScore);
  const label = getTrustLabel(trustScore);

  // Calculate averages from reports
  const avgCleanliness = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.cleanliness, 0) / reports.length)
    : 3;
  const avgPrivacy = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.privacy, 0) / reports.length)
    : 3;
  const avgSafety = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.safety, 0) / reports.length)
    : 3;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>
        <div className="mt-3 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{place.name}</h1>
            {place.address && (
              <p className="text-sm text-slate-500 mt-1">{place.address}</p>
            )}
          </div>
          <MoodEmoji mood={mood} size="lg" />
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {/* Place photo area - placeholder toilet image */}
        <section className="mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-200 aspect-[4/3] relative">
          <Image
            src={PLACEHOLDER_TOILET_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            unoptimized
          />
        </section>

        {/* Score Card */}
        <section className="mb-6 rounded-xl bg-white shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Overall Rating</p>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold text-slate-800">{trustScore}</span>
                <TrustScoreBadge score={trustScore} variant="badge" />
              </div>
              <p className="text-sm text-slate-500 mt-2">{reports.length} ratings</p>
            </div>
            {trustScore >= 80 && (
              <div className="text-center">
                <span className="text-3xl">👑</span>
                <p className="text-xs font-medium text-amber-600 mt-1">Verified King</p>
              </div>
            )}
          </div>
        </section>

        {/* Ratings Breakdown */}
        <section className="mb-6 rounded-xl bg-white shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Ratings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 w-24">Cleanliness</span>
              <StarRating value={avgCleanliness} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 w-24">Privacy</span>
              <StarRating value={avgPrivacy} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 w-24">Safety</span>
              <StarRating value={avgSafety} />
            </div>
          </div>
        </section>

        {/* Signals */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Amenities</h2>
          <PlaceDetailSignals reports={reports} />
        </section>

        {/* Summary */}
        <section className="mb-6 rounded-xl bg-white shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">What to know</h2>
          <p className="text-slate-600">{summary}</p>
        </section>

        {/* Recent Reports */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Recent reports</h2>
          {reports.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-6 text-center">
              <p className="text-slate-500">No reports yet. Be the first!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl bg-white border border-slate-200 p-4"
                >
                  {r.photo_urls && r.photo_urls.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                      {r.photo_urls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200"
                        >
                          <Image
                            src={url}
                            alt="Report photo"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                    <span className="flex items-center gap-1">
                      🧹 {r.cleanliness}/5
                    </span>
                    <span className="flex items-center gap-1">
                      🔒 {r.privacy}/5
                    </span>
                    <span className="flex items-center gap-1">
                      🛡️ {r.safety}/5
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    {r.has_lock && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Has Lock</span>
                    )}
                    {r.has_tp && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Has TP</span>
                    )}
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                      {r.access.replace("_", " ")}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="text-slate-700 italic">&ldquo;{r.notes}&rdquo;</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CTA */}
        <Link
          href={`/p/${placeId}/report`}
          className="block w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl text-center shadow-md hover:from-sky-600 hover:to-sky-700 transition-all"
        >
          Add a report →
        </Link>
      </div>
    </main>
  );
}
