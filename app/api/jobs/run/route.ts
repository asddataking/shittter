import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { moderateNotes, computeAiQuality } from "@/lib/moderation";
import {
  computeTrustScore,
  buildSummary,
  type ReportForScore,
} from "@/lib/trust-score";

const BATCH_SIZE = 20;

export async function POST(request: NextRequest) {
  const secret =
    request.headers.get("x-cron-secret") ??
    request.headers.get("x-admin-secret") ??
    request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: jobs, error: jobsErr } = await supabaseServer
    .from("jobs")
    .select("id, report_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (jobsErr || !jobs?.length) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;
  for (const job of jobs) {
    await supabaseServer
      .from("jobs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", job.id);

    const { data: report, error: reportErr } = await supabaseServer
      .from("reports")
      .select("*")
      .eq("id", job.report_id)
      .single();
    if (reportErr || !report) {
      await supabaseServer
        .from("jobs")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", job.id);
      continue;
    }

    const status = moderateNotes(report.notes);
    const ai_quality = computeAiQuality(report.notes);
    await supabaseServer
      .from("reports")
      .update({
        ai_status: status,
        ai_quality,
        ai_flags: report.ai_flags ?? {},
      })
      .eq("id", report.id);

    const placeId = report.place_id as string;
    const { data: approvedReports } = await supabaseServer
      .from("reports")
      .select("cleanliness, privacy, safety, has_lock, has_tp, created_at")
      .eq("place_id", placeId)
      .eq("ai_status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);
    const list = (approvedReports ?? []) as ReportForScore[];
    const trust_score = computeTrustScore(list);
    const summary = buildSummary(list);
    await supabaseServer.from("place_scores").upsert(
      {
        place_id: placeId,
        trust_score,
        summary,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "place_id" }
    );

    await supabaseServer
      .from("jobs")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("id", job.id);
    processed++;
  }
  return NextResponse.json({ processed });
}
