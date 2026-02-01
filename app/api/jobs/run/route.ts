import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { moderateNotes, computeAiQuality } from "@/lib/moderation";
import {
  computeTrustScore,
  buildSummary,
  type ReportForScore,
} from "@/lib/trust-score";

const BATCH_SIZE = 20;

function isAuthorized(request: NextRequest): boolean {
  const bearer = request.headers.get("authorization");
  if (bearer === `Bearer ${process.env.CRON_SECRET}`) return true;
  const secret =
    request.headers.get("x-cron-secret") ??
    request.headers.get("x-admin-secret") ??
    request.nextUrl.searchParams.get("secret");
  return secret === process.env.ADMIN_SEED_SECRET;
}

async function processJobs() {
  const jobs = await sql`
    select id, report_id from jobs
    where status = 'pending'
    order by created_at asc limit ${BATCH_SIZE}
  `;
  if (!jobs?.length) {
    return { processed: 0 };
  }

  let processed = 0;
  for (const job of jobs as { id: string; report_id: string }[]) {
    await sql`update jobs set status = 'processing', updated_at = now() where id = ${job.id}`;

    const [reportRow] = await sql`select * from reports where id = ${job.report_id}`;
    if (!reportRow) {
      await sql`update jobs set status = 'failed', updated_at = now() where id = ${job.id}`;
      continue;
    }
    const report = reportRow as Record<string, unknown>;

    const status = moderateNotes(report.notes as string | null);
    const ai_quality = computeAiQuality(report.notes as string | null);
    await sql`
      update reports set ai_status = ${status}, ai_quality = ${ai_quality}
      where id = ${job.report_id}
    `;

    const placeId = report.place_id as string;
    const approvedReports = await sql`
      select cleanliness, privacy, safety, has_lock, has_tp, created_at from reports
      where place_id = ${placeId} and ai_status = 'approved'
      order by created_at desc limit 20
    `;
    const list = (approvedReports ?? []) as ReportForScore[];
    const trust_score = computeTrustScore(list);
    const summary = buildSummary(list);

    await sql`
      insert into place_scores (place_id, trust_score, summary, updated_at)
      values (${placeId}, ${trust_score}, ${summary}, now())
      on conflict (place_id) do update set trust_score = ${trust_score}, summary = ${summary}, updated_at = now()
    `;

    await sql`update jobs set status = 'done', updated_at = now() where id = ${job.id}`;
    processed++;
  }
  return { processed };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processJobs();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processJobs();
  return NextResponse.json(result);
}
