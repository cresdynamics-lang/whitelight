-- Add tennis to product_category enum (safe if already present)
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'product_category'
      and e.enumlabel = 'tennis'
  ) then
    alter type public.product_category add value 'tennis';
  end if;
end
$$;
