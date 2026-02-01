import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { PlaceDetailResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [placeRes, scoreRes, reportsRes] = await Promise.all([
    supabaseServer.from("places").select("*").eq("id", id).single(),
    supabaseServer.from("place_scores").select("*").eq("place_id", id).single(),
    supabaseServer
      .from("reports")
      .select("*")
      .eq("place_id", id)
      .eq("ai_status", "approved")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (placeRes.error || !placeRes.data) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  const response: PlaceDetailResponse = {
    place: placeRes.data as PlaceDetailResponse["place"],
    score: scoreRes.data as PlaceDetailResponse["score"],
    reports: (reportsRes.data ?? []) as PlaceDetailResponse["reports"],
  };
  return NextResponse.json(response);
}
