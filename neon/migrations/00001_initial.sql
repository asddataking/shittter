-- Extensions (enable PostGIS in Neon Console or run: create extension postgis; create extension pgcrypto;)
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- places
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  geom geography(Point, 4326) not null,
  google_place_id text unique,
  source text not null default 'manual' check (source in ('manual', 'google')),
  created_at timestamptz default now()
);

create index if not exists places_geom_gix on places using gist (geom);

-- reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  cleanliness int not null check (cleanliness between 1 and 5),
  privacy int not null check (privacy between 1 and 5),
  safety int not null check (safety between 1 and 5),
  has_lock boolean not null default false,
  has_tp boolean not null default false,
  access text not null default 'public' check (access in ('public', 'customers_only', 'code_required', 'unknown')),
  notes text,
  device_hash text not null,
  ai_status text not null default 'pending' check (ai_status in ('pending', 'approved', 'rejected')),
  ai_flags jsonb default '{}'::jsonb,
  ai_quality int check (ai_quality between 0 and 100),
  created_at timestamptz default now()
);

create index if not exists reports_place_created_idx on reports(place_id, created_at desc);
create index if not exists reports_approved_idx on reports(place_id, created_at desc) where ai_status = 'approved';

-- place_scores
create table if not exists place_scores (
  place_id uuid primary key references places(id) on delete cascade,
  trust_score int not null default 50 check (trust_score between 0 and 100),
  summary text,
  updated_at timestamptz default now()
);

-- jobs
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists jobs_status_created_idx on jobs(status, created_at asc);
