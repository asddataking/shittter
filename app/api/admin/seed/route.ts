import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const SEED_PLACES = [
  { name: "Urban Grind Coffee", address: "123 Main St", lat: 37.7749, lng: -122.4194 },
  { name: "Target", address: "456 Market St", lat: 37.7849, lng: -122.4094 },
  { name: "24Hr Gas & Go", address: "789 Oak Ave", lat: 37.7649, lng: -122.4294 },
];

export async function POST(request: NextRequest) {
  let body: { secret?: string } = {};
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      body = await request.json();
    }
  } catch {
    // ignore
  }
  const secret =
    request.headers.get("x-admin-secret") ??
    request.nextUrl.searchParams.get("secret") ??
    body.secret;
  if (secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inserted: string[] = [];
  for (const p of SEED_PLACES) {
    const { data: id, error } = await supabaseServer.rpc("insert_place", {
      p_name: p.name,
      p_address: p.address,
      p_lat: p.lat,
      p_lng: p.lng,
      p_google_place_id: null,
    });
    if (!error && id) inserted.push(id as string);
  }
  return NextResponse.json({ success: true, inserted: inserted.length });
}
