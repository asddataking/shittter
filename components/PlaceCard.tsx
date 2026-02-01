import Link from "next/link";
import { MoodEmoji } from "./MoodEmoji";
import type { PlaceWithScore } from "@/lib/types";
import { getTrustLabel, getTrustBadgeClass, getMoodFromScore } from "@/lib/types";

function formatDistance(m: number): string {
  if (m < 304.8) return `${Math.round(m * 3.28084)} ft`;
  return `${(m / 1609.34).toFixed(1)} mi`;
}

function StarRating({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < filled ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface PlaceCardProps {
  place: PlaceWithScore;
  reportCount?: number;
  avgCleanliness?: number;
  avgPrivacy?: number;
  isVerified?: boolean;
}

export function PlaceCard({ 
  place, 
  reportCount,
  avgCleanliness,
  avgPrivacy,
  isVerified = false,
}: PlaceCardProps) {
  const displayReportCount = reportCount ?? place.report_count ?? Math.round((place.trust_score / 100) * 500 + 50);
  const badge = getTrustLabel(place.trust_score);
  const badgeClass = getTrustBadgeClass(place.trust_score);
  const mood = getMoodFromScore(place.trust_score);
  
  // Derive cleanliness/privacy from trust score if not provided
  const cleanliness = avgCleanliness ?? Math.round((place.trust_score / 100) * 5);
  const privacy = avgPrivacy ?? Math.round(((place.trust_score + 10) / 110) * 5);
  const overallStars = Math.round((place.trust_score / 100) * 5 * 10) / 10;

  return (
    <Link
      href={`/p/${place.id}`}
      className="block rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden transition hover:shadow-md hover:border-sky-200"
    >
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-24 h-28 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Title row */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-800 truncate">{place.name}</h3>
                <span className="text-amber-500 text-sm">★</span>
                <span className="text-slate-500 text-sm">{formatDistance(place.distance_m)}</span>
              </div>

              {/* Badge and ratings count */}
              <div className="flex items-center gap-2 mt-1">
                <span className={badgeClass}>{badge.toUpperCase()}</span>
                <span className="text-xs text-slate-500">{displayReportCount.toLocaleString()} ratings</span>
              </div>

              {/* Cleanliness rating */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-500 w-20">Cleanliness</span>
                <StarRating filled={cleanliness} />
                <span className="text-xs text-slate-400 ml-1">C</span>
                <StarRating filled={5 - cleanliness} />
              </div>

              {/* Privacy rating */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 w-20">Privacy</span>
                <StarRating filled={privacy} />
                <span className="text-xs text-slate-400 ml-1">C</span>
                <StarRating filled={5 - privacy} />
              </div>

              {/* Verified badge */}
              {(isVerified || place.trust_score >= 80) && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-amber-500">👑</span>
                  <span className="text-xs font-medium text-slate-600">Verified King Shitter</span>
                </div>
              )}
            </div>

            {/* Mood Emoji */}
            <div className="flex-shrink-0">
              <MoodEmoji mood={mood} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-4">
          {/* Accessibility icons */}
          {place.has_lock_majority && (
            <span className="text-slate-500" title="Has lock">🔒</span>
          )}
          {place.has_tp_majority && (
            <span className="text-slate-500" title="Has TP">🧻</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-slate-700">
            <span className="text-amber-500">★</span> {overallStars.toFixed(1)}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">Policy</span>
          <span className="text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">0.1%</span>
        </div>
      </div>
    </Link>
  );
}
