# Shittter

Find a bathroom you can trust. Crowdsourced, anonymous, honest.

## Stack

- Next.js 14+ (App Router), TypeScript
- Tailwind CSS
- Neon (serverless Postgres + PostGIS)
- Neon Auth (Better Auth)
- Leaflet + OpenStreetMap (no API key)

## Setup

### 1. Create Neon project

1. Go to [Neon](https://neon.tech) and create a new project.
2. In the Neon Console, enable the **PostGIS** extension: run `create extension if not exists postgis;` and `create extension if not exists pgcrypto;` in the SQL Editor (or use Extensions in the dashboard).
3. Copy your **connection string** (Connection string → pooled) for `DATABASE_URL`.

### 2. Run migrations

In the Neon SQL Editor, run the SQL files in `neon/migrations/` in order:

1. `00001_initial.sql` — tables (places, reports, place_scores, jobs)
2. `00002_functions.sql` — `get_places_nearby`, `insert_place`
3. `00003_report_photos.sql` — report_photos table, places.primary_photo_url
4. `00004_seed_places.sql` — seed places (Ann Arbor, MI)

### 3. Enable Neon Auth

1. In Neon Console: **Project → Branch → Auth → Configuration**.
2. Enable Auth and copy your **Auth URL** (e.g. `https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth`).
3. Generate a cookie secret: `openssl rand -base64 32`.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL` — Neon connection string (pooled)
- `NEON_AUTH_BASE_URL` — Auth URL from Neon Console (Auth → Configuration)
- `NEON_AUTH_COOKIE_SECRET` — at least 32 characters (e.g. from `openssl rand -base64 32`)
- `DEVICE_HASH_SALT` — any random string for hashing device identifiers
- `ADMIN_SEED_SECRET` — secret for jobs/run (process pending reports)

Optional:

- `AI_PROVIDER_KEY` — for future AI features

### 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Sign in / Sign up**: `/auth/sign-in`, `/auth/sign-up`
- **Account**: `/account/settings` (protected)

### 6. Process reports (jobs)

Reports are submitted with `ai_status: pending`. To run moderation and recompute TrustScores:

```bash
curl -X POST http://localhost:3000/api/jobs/run -H "x-cron-secret: YOUR_ADMIN_SEED_SECRET"
```

Run on a schedule (e.g. every 1–5 minutes) via Vercel Cron or an external cron.

## Deploy to Vercel

1. Push to GitHub and import in Vercel.
2. Set env vars: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `DEVICE_HASH_SALT`, `ADMIN_SEED_SECRET`.
3. Deploy. Optionally add a Vercel Cron for `POST /api/jobs/run`.

## Routes

- `/` — Home: map + list of nearby places, filters
- `/p/[placeId]` — Place detail: TrustScore, signals, summary, recent reports
- `/p/[placeId]/report` — Submit a report for a place
- `/report` — Report a new place (geolocation + name)
- `/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out` — Neon Auth
- `/account/settings`, `/account/security` — Account (protected)

## API

- `GET /api/places/nearby?lat=&lng=&radius=1200&minScore=&hasLock=&hasTp=` — Places within radius
- `GET /api/place/[id]` — Place + score + last 10 approved reports
- `POST /api/report` — Submit report (body: placeId or name+lat+lng, plus report fields)
- `POST /api/jobs/run` — Process pending reports (header: `x-cron-secret` or `x-admin-secret`)
