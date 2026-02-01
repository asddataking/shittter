import { getTrustLabel, type TrustLabel } from "@/lib/types";

const labelClass: Record<TrustLabel, string> = {
  Reliable: "bg-teal-100 text-teal-800 border-teal-200",
  Mixed: "bg-amber-50 text-amber-800 border-amber-200",
  Risky: "bg-slate-100 text-slate-700 border-slate-300",
};

interface TrustScoreBadgeProps {
  score: number;
  showNumber?: boolean;
  size?: "sm" | "md";
}

export function TrustScoreBadge({
  score,
  showNumber = true,
  size = "md",
}: TrustScoreBadgeProps) {
  const label = getTrustLabel(score);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-medium ${labelClass[label]} ${sizeClass}`}
    >
      {showNumber && <span>{score}</span>}
      <span>{label}</span>
    </span>
  );
}
