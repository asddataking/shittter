import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { PlaceDetailResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [placeRow] = await sql`
    select * from places where id = ${id}
  `;
  if (!placeRow) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const [scoreRow] = await sql`
    select * from place_scores where place_id = ${id}
  `;

  const reportsRows = await sql`
    select * from reports
    where place_id = ${id} and ai_status = 'approved'
    order by created_at desc limit 10
  `;

  const response: PlaceDetailResponse = {
    place: placeRow as PlaceDetailResponse["place"],
    score: (scoreRow as PlaceDetailResponse["score"]) ?? null,
    reports: (reportsRows ?? []) as PlaceDetailResponse["reports"],
  };
  return NextResponse.json(response);
}
