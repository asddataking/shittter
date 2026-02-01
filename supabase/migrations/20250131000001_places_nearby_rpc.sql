-- RPC: get places within radius with optional filters, joined with place_scores, sorted by trust_score desc, distance asc
create or replace function get_places_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_m double precision default 1200,
  p_min_score int default null,
  p_has_lock boolean default null,
  p_has_tp boolean default null
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
  and (
    p_has_lock is null
    or (p_has_lock = true and exists (
      select 1 from reports r where r.place_id = p.id and r.ai_status = 'approved' and r.has_lock = true
      group by r.place_id having count(*) > (select count(*) from reports r2 where r2.place_id = p.id and r2.ai_status = 'approved') / 2
    ))
    or (p_has_lock = false)
  )
  and (
    p_has_tp is null
    or (p_has_tp = true and exists (
      select 1 from reports r where r.place_id = p.id and r.ai_status = 'approved' and r.has_tp = true
      group by r.place_id having count(*) > (select count(*) from reports r2 where r2.place_id = p.id and r2.ai_status = 'approved') / 2
    ))
    or (p_has_tp = false)
  )
  order by coalesce(ps.trust_score, 50) desc, st_distance(p.geom, pt) asc;
end;
$$;

-- Simplify: has_lock / has_tp filter = "majority of approved reports have it"
-- The above exists/having is complex. Simpler: use a subquery that computes majority lock/tp per place and join.
-- Actually for v1 we can do filter in application layer after fetching, or use a simpler SQL.
-- Simpler approach: return all within radius with scores; filter has_lock/has_tp in API by checking report aggregates.
-- Even simpler: add two optional params; in SQL we filter places where (select count(*) filter (has_lock) from reports where place_id and approved) > (count approved)/2 when p_has_lock = true.
-- Let me use a simpler RPC that only does lat/lng/radius and min_score; has_lock and has_tp we filter in the API by fetching and filtering, or we add a second query. Actually the plan says "Apply filters" in the API - so we can do radius + minScore in SQL and then filter has_lock/has_tp in JS by looking at reports. That would require either two round-trips or a more complex SQL. The spec says "Apply filters" so let's do it in one go. I'll use a simpler RPC: just lat, lng, radius, min_score. For has_lock/has_tp we need places where majority of approved reports have that. So:
-- has_lock = true => place_id in (select place_id from reports where ai_status='approved' group by place_id having count(*) filter (where has_lock) > count(*)/2)
-- So we need a subquery. Let me rewrite the function to be correct.
</think>
Simplifying the RPC: implementing radius and min_score in SQL; handling has_lock/has_tp in the API by filtering results.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace