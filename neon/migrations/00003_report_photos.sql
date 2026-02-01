-- report_photos: store image URLs for reports (actual files in Vercel Blob / object storage)
create table if not exists report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

create index if not exists report_photos_report_id_idx on report_photos(report_id);

-- optional: primary/placeholder image for a place
alter table places add column if not exists primary_photo_url text;
