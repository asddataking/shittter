-- RPC: insert place with geom from lat/lng (service role only in practice)
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
