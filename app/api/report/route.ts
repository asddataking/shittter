import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
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

  const rate = await checkReportRateLimit(deviceHash);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many reports. Try again later." },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }

  let placeId: string;
  if (data.placeId) {
    const [place] = await sql`select id from places where id = ${data.placeId}`;
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    placeId = (place as { id: string }).id;
  } else {
    const lat = data.lat!;
    const lng = data.lng!;
    const name = data.name!;
    const [row] = await sql`
      select insert_place(${name}, ${data.address ?? null}, ${lat}, ${lng}, ${data.google_place_id ?? null}) as id
    `;
    const newId = row?.id as string | undefined;
    if (!newId) {
      return NextResponse.json(
        { error: "Failed to create place" },
        { status: 500 }
      );
    }
    placeId = newId;
  }

  const [reportRow] = await sql`
    insert into reports (place_id, cleanliness, privacy, safety, has_lock, has_tp, access, notes, device_hash, ai_status, ai_flags)
    values (${placeId}, ${data.cleanliness}, ${data.privacy}, ${data.safety}, ${data.has_lock}, ${data.has_tp}, ${data.access}, ${data.notes ?? null}, ${deviceHash}, 'pending', '{}'::jsonb)
    returning id
  `;
  const reportId = (reportRow as { id: string } | undefined)?.id;
  if (!reportId) {
    return NextResponse.json({ error: "Failed to insert report" }, { status: 500 });
  }

  await sql`
    insert into jobs (report_id, status) values (${reportId}, 'pending')
  `;

  const photoUrls = data.photo_urls ?? [];
  for (const url of photoUrls) {
    await sql`
      insert into report_photos (report_id, url) values (${reportId}, ${url})
    `;
  }

  return NextResponse.json({ success: true, reportId }, { status: 201 });
}
