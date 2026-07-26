-- Remove demo seed categories (Dresses, Outerwear, Knitwear, Tailoring).
-- Products.category_id is ON DELETE SET NULL, so linked products keep working.

delete from public.categories
where id in (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103',
  '11111111-1111-1111-1111-111111111104'
);
