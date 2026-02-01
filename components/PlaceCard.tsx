import Link from "next/link";
import { TrustScoreBadge } from "./TrustScoreBadge";
import type { PlaceWithScore } from "@/lib/types";

function formatDistance(m: number): string {
  if (m < 304.8) return `${Math.round(m * 3.28084)} ft`;
  return `${(m / 1609.34).toFixed(1)} mi`;
}

interface PlaceCardProps {
  place: PlaceWithScore;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Link
      href={`/p/${place.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-slate-900">{place.name}</h3>
          <p className="text-sm text-slate-500">{formatDistance(place.distance_m)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TrustScoreBadge score={place.trust_score} size="sm" />
            {place.has_lock_majority === true && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                Lock
              </span>
            )}
            {place.has_tp_majority === true && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                TP
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
