# Shittter

Find a bathroom you can trust. Crowdsourced, anonymous, honest.

## Stack

- Next.js 14+ (App Router), TypeScript
- Tailwind CSS
- Supabase (Postgres + PostGIS)
- Google Maps JavaScript API

## Setup

### 1. Create Supabase project

1. Go to [Supabase](https://supabase.com) and create a new project.
2. In the SQL Editor, enable PostGIS if not already enabled (Supabase usually enables it for new projects). You can run: `create extension if not exists postgis;`

### 2. Run migrations

From the project root:

```bash
npx supabase db push
```

Or apply the SQL manually: run each file in `supabase/migrations/` in order (by filename) in the Supabase SQL Editor.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (keep secret)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps JavaScript API key
- `DEVICE_HASH_SALT` — any random string for hashing device identifiers
- `ADMIN_SEED_SECRET` — secret for admin seed and jobs/run endpoints

Optional:

- `AI_PROVIDER_KEY` — for future AI features

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed places (optional)

To add a few test places:

```bash
curl -X POST http://localhost:3000/api/admin/seed -H "x-admin-secret: YOUR_ADMIN_SEED_SECRET"
```

### 6. Process reports (jobs)

Reports are submitted with `ai_status: pending`. To run moderation and recompute TrustScores:

```bash
curl -X POST http://localhost:3000/api/jobs/run -H "x-cron-secret: YOUR_ADMIN_SEED_SECRET"
```

Run this on a schedule (e.g. every 1–5 minutes) via Vercel Cron or an external cron service.

## Deploy to Vercel

1. Push the repo to GitHub and import in Vercel.
2. Add the same env vars in Vercel project settings.
3. Deploy. Optionally add a Vercel Cron job for `POST /api/jobs/run` (use the same secret in a header).

## Routes

- `/` — Home: map + list of nearby places, filters
- `/p/[placeId]` — Place detail: TrustScore, signals, summary, recent reports
- `/p/[placeId]/report` — Submit a report for a place
- `/report` — Report a new place (uses geolocation + name)

## API

- `GET /api/places/nearby?lat=&lng=&radius=1200&minScore=&hasLock=&hasTp=` — Places within radius
- `GET /api/place/[id]` — Place + score + last 10 approved reports
- `POST /api/report` — Submit report (body: placeId or name+lat+lng, plus report fields)
- `POST /api/admin/seed` — Seed places (header: `x-admin-secret`)
- `POST /api/jobs/run` — Process pending reports (header: `x-cron-secret` or `x-admin-secret`)
