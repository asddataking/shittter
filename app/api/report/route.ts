import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { reportSubmitSchema } from "@/lib/schemas";
import { getDeviceHash } from "@/lib/device-hash";
import { checkReportRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = reportSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "";
  const deviceHash = getDeviceHash(ip, userAgent);

  const rate = await checkReportRateLimit(supabaseServer, deviceHash);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many reports. Try again later." },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }

  let placeId: string;
  if (data.placeId) {
    const { data: place } = await supabaseServer
      .from("places")
      .select("id")
      .eq("id", data.placeId)
      .single();
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    placeId = place.id;
  } else {
    const lat = data.lat!;
    const lng = data.lng!;
    const name = data.name!;
    const { data: newId, error: insertErr } = await supabaseServer.rpc(
      "insert_place",
      {
        p_name: name,
        p_address: data.address ?? null,
        p_lat: lat,
        p_lng: lng,
        p_google_place_id: data.google_place_id ?? null,
      }
    );
    if (insertErr || !newId) {
      return NextResponse.json(
        { error: insertErr?.message ?? "Failed to create place" },
        { status: 500 }
      );
    }
    placeId = newId as string;
  }

  const { data: report, error: reportErr } = await supabaseServer
    .from("reports")
    .insert({
      place_id: placeId,
      cleanliness: data.cleanliness,
      privacy: data.privacy,
      safety: data.safety,
      has_lock: data.has_lock,
      has_tp: data.has_tp,
      access: data.access,
      notes: data.notes ?? null,
      device_hash: deviceHash,
      ai_status: "pending",
      ai_flags: {},
    })
    .select("id")
    .single();
  if (reportErr) {
    return NextResponse.json({ error: reportErr.message }, { status: 500 });
  }

  await supabaseServer.from("jobs").insert({
    report_id: report.id,
    status: "pending",
  });

  return NextResponse.json({ success: true, reportId: report.id }, { status: 201 });
}
