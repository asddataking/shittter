import type { PlaceWithScore } from "@/lib/types";

/**
 * Seed places used by admin seed API and homepage fallback.
 * Coordinates are San Francisco (default map center).
 */
export const SEED_PLACES = [
  { name: "Urban Grind Coffee", address: "123 Main St", lat: 37.7749, lng: -122.4194 },
  { name: "Target", address: "456 Market St", lat: 37.7849, lng: -122.4094 },
  { name: "24Hr Gas & Go", address: "789 Oak Ave", lat: 37.7649, lng: -122.4294 },
] as const;

/** Fallback places shown on homepage when API returns empty or fails (e.g. DATABASE_URL not set on Vercel). */
export const FALLBACK_PLACES: PlaceWithScore[] = SEED_PLACES.map((p, i) => ({
  id: `fallback-${i}-${p.name.replace(/\s/g, "-").toLowerCase()}`,
  name: p.name,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  google_place_id: null,
  source: "manual",
  created_at: new Date().toISOString(),
  trust_score: 50,
  summary: "No reports yet. Be the first to help the next person.",
  distance_m: i * 500,
  report_count: 0,
}));
