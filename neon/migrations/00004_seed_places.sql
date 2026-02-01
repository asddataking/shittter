-- Seed places in Ann Arbor, Michigan (idempotent: only insert if name doesn't exist)
do $$
begin
  if not exists (select 1 from places where name = 'Urban Grind Coffee') then
    perform insert_place('Urban Grind Coffee', '123 Main St', 42.2814, -83.7485, null);
  end if;
  if not exists (select 1 from places where name = 'Target') then
    perform insert_place('Target', '456 Market St', 42.2780, -83.7382, null);
  end if;
  if not exists (select 1 from places where name = '24Hr Gas & Go') then
    perform insert_place('24Hr Gas & Go', '789 Oak Ave', 42.2865, -83.7420, null);
  end if;
end $$;
