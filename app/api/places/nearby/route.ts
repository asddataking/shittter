import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { nearbyQuerySchema } from "@/lib/schemas";
import type { PlaceWithScore } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set. Add it in Vercel Environment Variables." },
      { status: 503 }
    );
  }
  const { searchParams } = new URL(request.url);
  const parsed = nearbyQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    radius: searchParams.get("radius"),
    minScore: searchParams.get("minScore"),
    hasLock: searchParams.get("hasLock"),
    hasTp: searchParams.get("hasTp"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { lat, lng, radius, minScore, hasLock, hasTp } = parsed.data;

  let rows: Record<string, unknown>[];
  try {
    rows = (await sql`
      select * from get_places_nearby(${lat}, ${lng}, ${radius}, ${minScore ?? null})
    `) as Record<string, unknown>[];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown database error";
    console.error("places/nearby DB error:", err);
    return NextResponse.json(
      {
        error: "Database error. Check DATABASE_URL and that migrations have been run.",
        detail: message,
      },
      { status: 503 }
    );
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
  if (placeIds.length === 0) {
    return NextResponse.json(results);
  }

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
  if (hasLock === true || hasTp === true) {
    results = results.filter((p) => {
      const agg = byPlace.get(p.id);
      if (hasLock === true && agg) {
        const total = agg.lockYes + agg.lockNo;
        if (total === 0 || agg.lockYes <= total / 2) return false;
      }
      if (hasTp === true && agg) {
        const total = agg.tpYes + agg.tpNo;
        if (total === 0 || agg.tpYes <= total / 2) return false;
      }
      return true;
    });
  }
  results = results.map((p) => {
    const agg = byPlace.get(p.id);
    const total = agg ? agg.lockYes + agg.lockNo : 0;
    const lockMajority =
      total > 0 && agg ? agg.lockYes > total / 2 : undefined;
    const tpMajority = total > 0 && agg ? agg.tpYes > total / 2 : undefined;
    const report_count = reportCountByPlace.get(p.id) ?? 0;
    return {
      ...p,
      has_lock_majority: lockMajority,
      has_tp_majority: tpMajority,
      report_count,
    };
  });

  return NextResponse.json(results);
}
