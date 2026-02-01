import type { Report } from "./types";

export interface ReportForScore {
  cleanliness: number;
  privacy: number;
  safety: number;
  has_lock: boolean;
  has_tp: boolean;
  created_at: string;
}

/**
 * Compute TrustScore 0–100 from approved reports.
 * base = (avg_clean + avg_priv + avg_safe) / 15 -> 0..1
 * lock_bonus = 0.03 if majority has_lock
 * tp_bonus = 0.03 if majority has_tp
 * variance penalty: subtract up to 0.08 if stddev high
 */
export function computeTrustScore(reports: ReportForScore[]): number {
  if (reports.length === 0) return 50;

  const n = reports.length;
  const avgClean =
    reports.reduce((s, r) => s + r.cleanliness, 0) / n;
  const avgPriv = reports.reduce((s, r) => s + r.privacy, 0) / n;
  const avgSafe = reports.reduce((s, r) => s + r.safety, 0) / n;

  let base = (avgClean + avgPriv + avgSafe) / 15;
  base = Math.min(1, Math.max(0, base));

  const lockCount = reports.filter((r) => r.has_lock).length;
  const tpCount = reports.filter((r) => r.has_tp).length;
  const lockBonus = lockCount > n / 2 ? 0.03 : 0;
  const tpBonus = tpCount > n / 2 ? 0.03 : 0;

  const stddev =
    (reports.reduce((s, r) => {
      const c = (r.cleanliness + r.privacy + r.safety) / 15;
      return s + (c - base) ** 2;
    }, 0) / n) ** 0.5;
  const variancePenalty = Math.min(0.08, stddev * 0.5);

  let score = (base + lockBonus + tpBonus - variancePenalty) * 100;
  score = Math.round(Math.min(100, Math.max(0, score)));
  return score;
}

/**
 * Build a neutral 1–2 sentence summary from last N approved reports (template-based).
 */
export function buildSummary(reports: ReportForScore[]): string {
  if (reports.length === 0) {
    return "No reports yet. Be the first to help the next person.";
  }
  const n = reports.length;
  const avgClean =
    reports.reduce((s, r) => s + r.cleanliness, 0) / n;
  const avgPriv = reports.reduce((s, r) => s + r.privacy, 0) / n;
  const avgSafe = reports.reduce((s, r) => s + r.safety, 0) / n;
  const lockPct = (reports.filter((r) => r.has_lock).length / n) * 100;
  const tpPct = (reports.filter((r) => r.has_tp).length / n) * 100;

  const cleanWord =
    avgClean >= 4 ? "generally good" : avgClean >= 2.5 ? "mixed" : "often poor";
  const privWord =
    avgPriv >= 4 ? "good" : avgPriv >= 2.5 ? "mixed" : "limited";
  const safeWord =
    avgSafe >= 4 ? "good" : avgSafe >= 2.5 ? "mixed" : "variable";

  const lockLine =
    lockPct >= 60
      ? "Most report a lock."
      : lockPct >= 40
        ? "Lock availability varies."
        : "Many report no lock.";
  const tpLine =
    tpPct >= 60
      ? "TP usually available."
      : tpPct >= 40
        ? "TP availability varies."
        : "Bring your own TP recommended.";

  return `Based on recent reports: ${cleanWord} cleanliness, ${privWord} privacy, ${safeWord} safety. ${lockLine} ${tpLine}`;
}
