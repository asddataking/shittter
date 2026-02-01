import { z } from "zod";

const ratingSchema = z.number().int().min(1).max(5);
const accessSchema = z.enum([
  "public",
  "customers_only",
  "code_required",
  "unknown",
]);

const placeFieldsSchema = z.object({
  name: z.string().min(1).max(500),
  address: z.string().max(1000).optional().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  google_place_id: z.string().max(255).optional().nullable(),
});

export const reportSubmitSchema = z
  .object({
    placeId: z.string().uuid().optional(),
    name: z.string().min(1).max(500).optional(),
    address: z.string().max(1000).optional().nullable(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    google_place_id: z.string().max(255).optional().nullable(),
    cleanliness: ratingSchema,
    privacy: ratingSchema,
    safety: ratingSchema,
    has_lock: z.boolean(),
    has_tp: z.boolean(),
    access: accessSchema.default("public"),
    notes: z.string().max(240).optional().nullable(),
    photo_urls: z.array(z.string().url()).max(5).optional().default([]),
  })
  .refine(
    (data) => data.placeId ?? (data.name != null && data.lat != null && data.lng != null),
    { message: "Either placeId or (name, lat, lng) required", path: ["placeId"] }
  );

export type ReportSubmitInput = z.infer<typeof reportSubmitSchema>;

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(1200),
  minScore: z.coerce.number().min(0).max(100).optional(),
  hasLock: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  hasTp: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export type NearbyQueryInput = z.infer<typeof nearbyQuerySchema>;
