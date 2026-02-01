import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { nearbyQuerySchema } from "@/lib/schemas";
import type { PlaceWithScore } from "@/lib/types";

export async function GET(request: NextRequest) {
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

  const { data: rows, error } = await supabaseServer.rpc("get_places_nearby", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radius,
    p_min_score: minScore ?? null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  let results: PlaceWithScore[] = (rows ?? []).map((r: Record<string, unknown>) => ({
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
  const { data: reportAgg } = await supabaseServer
    .from("reports")
    .select("place_id, has_lock, has_tp")
    .in("place_id", placeIds)
    .eq("ai_status", "approved");
  const byPlace = new Map<
    string,
    { lockYes: number; lockNo: number; tpYes: number; tpNo: number }
  >();
  for (const r of reportAgg ?? []) {
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
    return {
      ...p,
      has_lock_majority: lockMajority,
      has_tp_majority: tpMajority,
    };
  });

  return NextResponse.json(results);
}
