-- =============================================================
-- Naz's Collection — Seed data (optional demo content)
-- Safe to run multiple times (uses stable UUIDs + upserts).
-- =============================================================

-- ---------------- Categories ----------------
insert into public.categories (id, name, slug, image_url) values
  ('11111111-1111-1111-1111-111111111101', 'Dresses',   'dresses',   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80'),
  ('11111111-1111-1111-1111-111111111102', 'Outerwear', 'outerwear', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80'),
  ('11111111-1111-1111-1111-111111111103', 'Knitwear',  'knitwear',  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80'),
  ('11111111-1111-1111-1111-111111111104', 'Tailoring', 'tailoring', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80')
on conflict (id) do update set
  name = excluded.name, slug = excluded.slug, image_url = excluded.image_url;

-- ---------------- Products ----------------
insert into public.products (id, title, slug, description, brand_name, weight, category_id, base_price, discount_price, featured, is_active) values
  ('22222222-2222-2222-2222-222222222201', 'Silk Slip Midi Dress', 'silk-slip-midi-dress',
    'A fluid bias-cut midi in pure mulberry silk. Cut to skim the body with an elegant cowl neckline.',
    'Maison Luxe', 280, '11111111-1111-1111-1111-111111111101', 289.00, 229.00, true, true),
  ('22222222-2222-2222-2222-222222222202', 'Wool Wrap Coat', 'wool-wrap-coat',
    'A timeless double-faced wool coat with a self-tie belt and dropped shoulders for a relaxed drape.',
    'Nord & Co', 920, '11111111-1111-1111-1111-111111111102', 549.00, null, true, true),
  ('22222222-2222-2222-2222-222222222203', 'Cashmere Rib Sweater', 'cashmere-rib-sweater',
    'Featherweight cashmere in a fine rib knit. An everyday luxury with a soft mock neck.',
    'Soft Form', 320, '11111111-1111-1111-1111-111111111103', 219.00, null, true, true),
  ('22222222-2222-2222-2222-222222222204', 'Tailored Wide-Leg Trouser', 'tailored-wide-leg-trouser',
    'High-rise wide-leg trousers in a crisp Italian wool blend with a pressed crease.',
    'Atelier Lane', 450, '11111111-1111-1111-1111-111111111104', 199.00, 159.00, true, true),
  ('22222222-2222-2222-2222-222222222205', 'Satin Column Gown', 'satin-column-gown',
    'A floor-sweeping column gown in liquid satin with a subtle thigh-high slit.',
    'Maison Luxe', 510, '11111111-1111-1111-1111-111111111101', 429.00, null, false, true),
  ('22222222-2222-2222-2222-222222222206', 'Belted Trench Coat', 'belted-trench-coat',
    'A modern take on the classic trench in water-resistant cotton gabardine.',
    'Nord & Co', 780, '11111111-1111-1111-1111-111111111102', 389.00, 329.00, false, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  brand_name = excluded.brand_name, weight = excluded.weight,
  base_price = excluded.base_price, discount_price = excluded.discount_price,
  featured = excluded.featured, is_active = excluded.is_active;

-- ---------------- Product images ----------------
insert into public.product_images (id, product_id, image_url, display_order) values
  ('33333333-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80', 0),
  ('33333333-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 1),
  ('33333333-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80', 0),
  ('33333333-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=80', 1),
  ('33333333-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', 0),
  ('33333333-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80', 0),
  ('33333333-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222205', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 0),
  ('33333333-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222206', 'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?auto=format&fit=crop&w=1000&q=80', 0)
on conflict (id) do update set image_url = excluded.image_url, display_order = excluded.display_order;

-- ---------------- Product variants ----------------
insert into public.product_variants (id, product_id, size, stock_quantity, price_override) values
  ('44444444-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222201', 'S', 12, null),
  ('44444444-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222201', 'M', 8,  null),
  ('44444444-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222202', 'S', 6,  null),
  ('44444444-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222202', 'L', 3,  null),
  ('44444444-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222203', 'S', 20, null),
  ('44444444-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222203', 'M', 14, null),
  ('44444444-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222204', 'M', 10, null),
  ('44444444-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222204', 'L', 7,  null),
  ('44444444-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222205', 'S', 4,  null),
  ('44444444-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222205', 'M', 2,  null),
  ('44444444-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222206', 'M', 9,  null),
  ('44444444-0000-0000-0000-000000000013', '22222222-2222-2222-2222-222222222206', 'L', 1,  null)
on conflict (id) do update set stock_quantity = excluded.stock_quantity;
