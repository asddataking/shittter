import { sql } from "@/lib/db";
import type { PlaceWithScore } from "@/lib/types";

/** Server-only: fetch all place IDs for sitemap. Returns [] if DB unavailable. */
export async function getAllPlaceIds(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = (await sql`select id from places`) as { id: string }[];
    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}

/**
 * Server-only: fetch places near a location for SEO pages (city/neighborhood).
 * Returns [] if DB is not configured or query fails.
 */
export async function getPlacesNearbyForSEO(
  lat: number,
  lng: number,
  radiusM: number,
  minScore: number | null = 60
): Promise<PlaceWithScore[]> {
  if (!process.env.DATABASE_URL) return [];
  let rows: Record<string, unknown>[];
  try {
    rows = (await sql`
      select * from get_places_nearby(${lat}, ${lng}, ${radiusM}, ${minScore})
    `) as Record<string, unknown>[];
  } catch {
    return [];
  }
  let results: PlaceWithScore[] = rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    address: r.address as string | null,
    lat: r.lat as number,
    lng: r.lng as number,
    google_place_id: r.google_place_id as string | null,
    source: r.source as "manual" | "google",
    created_at: r.created_at as string,
    trust_score: (r.trust_score as number) ?? 50,
    summary: r.summary as string | null,
    distance_m: (r.distance_m as number) ?? 0,
  }));

  const placeIds = results.map((p) => p.id);
  if (placeIds.length === 0) return results;

  const [reportAgg, countRows] = await Promise.all([
    sql`
      select place_id, has_lock, has_tp from reports
      where place_id = any(${placeIds}) and ai_status = 'approved'
    `,
    sql`
      select place_id, count(*)::int as report_count from reports
      where place_id = any(${placeIds}) and ai_status = 'approved'
      group by place_id
    `,
  ]);
  const reportCountByPlace = new Map<string, number>();
  for (const row of countRows as { place_id: string; report_count: number }[]) {
    reportCountByPlace.set(row.place_id, row.report_count);
  }
  const byPlace = new Map<
    string,
    { lockYes: number; lockNo: number; tpYes: number; tpNo: number }
  >();
  for (const r of reportAgg as { place_id: string; has_lock: boolean; has_tp: boolean }[]) {
    const cur = byPlace.get(r.place_id) ?? {
      lockYes: 0,
      lockNo: 0,
      tpYes: 0,
      tpNo: 0,
    };
    if (r.has_lock) cur.lockYes++;
    else cur.lockNo++;
    if (r.has_tp) cur.tpYes++;
    else cur.tpNo++;
    byPlace.set(r.place_id, cur);
  }
  return results.map((p) => {
    const agg = byPlace.get(p.id);
    const total = agg ? agg.lockYes + agg.lockNo : 0;
    const has_lock_majority =
      total > 0 && agg ? agg.lockYes > total / 2 : undefined;
    const has_tp_majority = total > 0 && agg ? agg.tpYes > total / 2 : undefined;
    const report_count = reportCountByPlace.get(p.id) ?? 0;
    return {
      ...p,
      has_lock_majority,
      has_tp_majority,
      report_count,
    };
  });
}
