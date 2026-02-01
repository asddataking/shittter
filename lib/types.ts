export interface Place {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  google_place_id: string | null;
  source: "manual" | "google";
  created_at: string;
}

export interface Report {
  id: string;
  place_id: string;
  cleanliness: number;
  privacy: number;
  safety: number;
  has_lock: boolean;
  has_tp: boolean;
  access: "public" | "customers_only" | "code_required" | "unknown";
  notes: string | null;
  device_hash: string;
  ai_status: "pending" | "approved" | "rejected";
  ai_flags: Record<string, unknown>;
  ai_quality: number | null;
  created_at: string;
}

/** Report with optional photo URLs (from report_photos). */
export interface ReportWithPhotos extends Report {
  photo_urls?: string[];
}

export interface PlaceScore {
  place_id: string;
  trust_score: number;
  summary: string | null;
  updated_at: string;
}

export interface Job {
  id: string;
  report_id: string;
  status: "pending" | "processing" | "done" | "failed";
  created_at: string;
  updated_at: string;
}

export interface PlaceWithScore extends Place {
  trust_score: number;
  summary: string | null;
  distance_m: number;
  has_lock_majority?: boolean;
  has_tp_majority?: boolean;
  report_count?: number;
}

export interface PlaceDetailResponse {
  place: Place;
  score: PlaceScore | null;
  reports: ReportWithPhotos[];
}

export type TrustLabel = "Glorious" | "Decent" | "Courage Required" | "Risky";

export function getTrustLabel(score: number): TrustLabel {
  if (score >= 80) return "Glorious";
  if (score >= 60) return "Decent";
  if (score >= 40) return "Courage Required";
  return "Risky";
}

export function getTrustBadgeClass(score: number): string {
  if (score >= 80) return "badge-glorious";
  if (score >= 60) return "badge-decent";
  if (score >= 40) return "badge-courage";
  return "badge-risky";
}

export type MoodType = "glorious" | "decent" | "meh" | "sick";

export function getMoodFromScore(score: number): MoodType {
  if (score >= 80) return "glorious";
  if (score >= 60) return "decent";
  if (score >= 40) return "meh";
  return "sick";
}
