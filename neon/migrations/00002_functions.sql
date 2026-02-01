-- get_places_nearby: lat, lng, radius_m, min_score (has_lock/has_tp filtered in API)
create or replace function get_places_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_m double precision default 1200,
  p_min_score int default null
)
returns table (
  id uuid,
  name text,
  address text,
  lat double precision,
  lng double precision,
  google_place_id text,
  source text,
  created_at timestamptz,
  trust_score int,
  summary text,
  distance_m double precision
)
language plpgsql
security definer
set search_path = public
as $$
declare
  pt geography;
begin
  pt := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  return query
  select
    p.id,
    p.name,
    p.address,
    p.lat,
    p.lng,
    p.google_place_id,
    p.source,
    p.created_at,
    coalesce(ps.trust_score, 50)::int,
    ps.summary,
    round((st_distance(p.geom, pt))::numeric, 0)::double precision as distance_m
  from places p
  left join place_scores ps on ps.place_id = p.id
  where st_dwithin(p.geom, pt, p_radius_m)
  and (p_min_score is null or coalesce(ps.trust_score, 50) >= p_min_score)
  order by coalesce(ps.trust_score, 50) desc, st_distance(p.geom, pt) asc;
end;
$$;

-- insert_place
create or replace function insert_place(
  p_name text,
  p_address text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_google_place_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_geom geography;
begin
  v_geom := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  insert into places (name, address, lat, lng, geom, google_place_id, source)
  values (p_name, p_address, p_lat, p_lng, v_geom, p_google_place_id, 'manual')
  returning id into v_id;
  insert into place_scores (place_id, trust_score, summary)
  values (v_id, 50, 'No reports yet. Be the first to help the next person.');
  return v_id;
end;
$$;
