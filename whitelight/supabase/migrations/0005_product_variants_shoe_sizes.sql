-- Allow shoe sizes 36–47 on product_variants and remove legacy restrictive CHECKs
-- (Admin stores size as text; 46/47 must not fail on insert/update.)

-- 1) Drop legacy CHECK constraints on product_variants.size (e.g. capped at 45)
do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public'
      and t.relname = 'product_variants'
      and c.contype = 'c'
      and (
        pg_get_constraintdef(c.oid) ilike '%size%'
        or pg_get_constraintdef(c.oid) ilike '%between%36%'
        or pg_get_constraintdef(c.oid) ilike '%between%45%'
      )
  loop
    execute format('alter table public.product_variants drop constraint if exists %I', r.conname);
  end loop;
end
$$;

-- 2) Replace with one permissive rule: accessory codes 1–9, shoe EU 36–47, or non-numeric labels
alter table public.product_variants drop constraint if exists product_variants_size_allowed;

alter table public.product_variants
  add constraint product_variants_size_allowed check (
    length(trim(size)) > 0
    and (
      not (trim(size) ~ '^[0-9]+$')
      or (trim(size)::integer between 1 and 9)
      or (trim(size)::integer between 36 and 47)
    )
  );

comment on column public.product_variants.size is
  'Shoe EU sizes 36–47 as text; accessory codes 1–9; or non-numeric labels (e.g. XS, M).';
