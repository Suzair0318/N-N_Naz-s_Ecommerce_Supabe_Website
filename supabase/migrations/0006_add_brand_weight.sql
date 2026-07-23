-- =============================================================
-- Naz's Collection — 0006 Add brand_name + weight to products
-- Run this if products table already exists (from earlier 0001).
-- Weight is stored in grams (g).
-- =============================================================

alter table public.products
  add column if not exists brand_name text;

alter table public.products
  add column if not exists weight numeric(10, 2);

-- Ensure non-negative weight when provided
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_weight_non_negative'
  ) then
    alter table public.products
      add constraint products_weight_non_negative
      check (weight is null or weight >= 0);
  end if;
end $$;
