-- Extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- places
create table places (
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

create index places_geom_gix on places using gist (geom);

-- reports
create table reports (
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

create index reports_place_created_idx on reports(place_id, created_at desc);
create index reports_approved_idx on reports(place_id, created_at desc) where ai_status = 'approved';

-- place_scores
create table place_scores (
  place_id uuid primary key references places(id) on delete cascade,
  trust_score int not null default 50 check (trust_score between 0 and 100),
  summary text,
  updated_at timestamptz default now()
);

-- jobs (async AI)
create table jobs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index jobs_status_created_idx on jobs(status, created_at asc);

-- RLS
alter table places enable row level security;
alter table reports enable row level security;
alter table place_scores enable row level security;
alter table jobs enable row level security;

-- places: anon can only select
create policy "places_select_anon" on places for select to anon using (true);
create policy "places_insert_service" on places for insert to service_role with check (true);
create policy "places_update_service" on places for update to service_role using (true);
create policy "places_delete_service" on places for delete to service_role using (true);

-- place_scores: anon can only select
create policy "place_scores_select_anon" on place_scores for select to anon using (true);
create policy "place_scores_upsert_service" on place_scores for all to service_role using (true) with check (true);

-- reports: anon can select only approved
create policy "reports_select_approved_anon" on reports for select to anon using (ai_status = 'approved');
create policy "reports_insert_service" on reports for insert to service_role with check (true);
create policy "reports_update_service" on reports for update to service_role using (true);
create policy "reports_delete_service" on reports for delete to service_role using (true);

-- jobs: no anon access
create policy "jobs_all_service" on jobs for all to service_role using (true) with check (true);
