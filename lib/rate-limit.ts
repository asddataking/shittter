/**
 * Rate limit: max 3 reports/hour and 10 reports/day per device_hash.
 * Uses Supabase to count reports by device_hash in last hour and last 24h.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_PER_HOUR = 3;
const MAX_PER_DAY = 10;

export async function checkReportRateLimit(
  supabase: SupabaseClient,
  deviceHash: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { count: hourCount, error: hourError } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("device_hash", deviceHash)
    .gte("created_at", oneHourAgo.toISOString());

  if (hourError) return { allowed: true };
  if ((hourCount ?? 0) >= MAX_PER_HOUR) {
    return { allowed: false, retryAfter: 3600 };
  }

  const { count: dayCount, error: dayError } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("device_hash", deviceHash)
    .gte("created_at", oneDayAgo.toISOString());

  if (dayError) return { allowed: true };
  if ((dayCount ?? 0) >= MAX_PER_DAY) {
    return { allowed: false, retryAfter: 86400 };
  }

  return { allowed: true };
}
