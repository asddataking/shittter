import type { Report } from "@/lib/types";

interface PlaceDetailSignalsProps {
  reports: Report[];
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function StarRating({ value }: { value: number }) {
  const v = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="text-amber-500" aria-label={`${v} out of 5`}>
      {"★".repeat(v)}{"☆".repeat(5 - v)}
    </span>
  );
}

export function PlaceDetailSignals({ reports }: PlaceDetailSignalsProps) {
  if (reports.length === 0) {
    return (
      <p className="text-sm text-slate-500">No reports yet.</p>
    );
  }
  const cleanliness = avg(reports.map((r) => r.cleanliness));
  const privacy = avg(reports.map((r) => r.privacy));
  const safety = avg(reports.map((r) => r.safety));
  const lockPct =
    (reports.filter((r) => r.has_lock).length / reports.length) * 100;
  const tpPct =
    (reports.filter((r) => r.has_tp).length / reports.length) * 100;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-700">Cleanliness</p>
        <StarRating value={cleanliness} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-700">Privacy</p>
        <StarRating value={privacy} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-700">Safety</p>
        <StarRating value={safety} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-700">Lock</p>
        <p className="text-sm text-slate-600">
          {lockPct >= 60 ? "Most say yes" : lockPct >= 40 ? "Mixed" : "Many say no"}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-700">TP</p>
        <p className="text-sm text-slate-600">
          {tpPct >= 60 ? "Usually available" : tpPct >= 40 ? "Mixed" : "Bring your own"}
        </p>
      </div>
    </div>
  );
}
