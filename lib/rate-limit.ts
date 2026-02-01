/**
 * Rate limit: max 3 reports/hour and 10 reports/day per device_hash.
 */

import { sql } from "@/lib/db";

const MAX_PER_HOUR = 3;
const MAX_PER_DAY = 10;

export async function checkReportRateLimit(
  deviceHash: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [hourRow] = await sql`
    select count(*)::int as c from reports
    where device_hash = ${deviceHash} and created_at >= ${oneHourAgo}
  `;
  const hourCount = (hourRow?.c as number) ?? 0;
  if (hourCount >= MAX_PER_HOUR) return { allowed: false, retryAfter: 3600 };

  const [dayRow] = await sql`
    select count(*)::int as c from reports
    where device_hash = ${deviceHash} and created_at >= ${oneDayAgo}
  `;
  const dayCount = (dayRow?.c as number) ?? 0;
  if (dayCount >= MAX_PER_DAY) return { allowed: false, retryAfter: 86400 };

  return { allowed: true };
}
