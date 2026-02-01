import { getTrustLabel, getTrustBadgeClass, type TrustLabel } from "@/lib/types";

const labelClass: Record<TrustLabel, string> = {
  "Glorious": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Decent": "bg-sky-100 text-sky-800 border-sky-200",
  "Courage Required": "bg-amber-100 text-amber-800 border-amber-200",
  "Risky": "bg-red-100 text-red-800 border-red-200",
};

interface TrustScoreBadgeProps {
  score: number;
  showNumber?: boolean;
  size?: "sm" | "md";
  variant?: "pill" | "badge";
}

export function TrustScoreBadge({
  score,
  showNumber = true,
  size = "md",
  variant = "pill",
}: TrustScoreBadgeProps) {
  const label = getTrustLabel(score);
  
  if (variant === "badge") {
    const badgeClass = getTrustBadgeClass(score);
    return (
      <span className={badgeClass}>
        {label.toUpperCase()}
      </span>
    );
  }
  
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
