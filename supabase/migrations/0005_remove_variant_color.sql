-- =============================================================
-- Naz's Collection — 0005 Remove color from variants
-- Run this ONLY if you already created product_variants with the
-- color/color_hex columns. Fresh installs of 0001 don't need it.
-- =============================================================

-- Drop the old (product_id, size, color) uniqueness and add (product_id, size).
alter table public.product_variants
  drop constraint if exists product_variants_product_id_size_color_key;

-- Remove duplicate size rows per product before enforcing uniqueness,
-- keeping the row with the most stock.
delete from public.product_variants pv
using public.product_variants dup
where pv.product_id = dup.product_id
  and pv.size = dup.size
  and pv.stock_quantity < dup.stock_quantity;

alter table public.product_variants
  drop column if exists color,
  drop column if exists color_hex;

alter table public.product_variants
  add constraint product_variants_product_id_size_key
  unique (product_id, size);
