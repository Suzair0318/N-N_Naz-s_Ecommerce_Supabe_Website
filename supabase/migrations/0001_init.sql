-- =============================================================
-- Naz's Collection — 0001 Schema
-- Tables, enums, indexes, and profile bootstrap trigger.
-- Run this first.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Enums (as CHECK constraints for flexibility) ----------
-- roles: customer | admin
-- sizes: XS | S | M | L | XL | Custom
-- payment_method: COD | Card
-- payment_status: pending | paid | failed
-- order_status: pending | processing | shipped | delivered | cancelled

-- ---------- profiles ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  phone       text,
  address     jsonb,
  created_at  timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  image_url  text,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  description    text,
  brand_name     text,
  -- Product weight in grams (for shipping / admin records)
  weight         numeric(10, 2) check (weight is null or weight >= 0),
  category_id    uuid references public.categories (id) on delete set null,
  base_price     numeric(10, 2) not null default 0,
  discount_price numeric(10, 2),
  featured       boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);
create index if not exists products_featured_idx on public.products (featured);

-- ---------- product_images ----------
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  image_url     text not null,
  display_order integer not null default 0
);

create index if not exists product_images_product_idx on public.product_images (product_id);

-- ---------- product_variants ----------
create table if not exists public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  size           text not null check (size in ('XS', 'S', 'M', 'L', 'XL', 'Custom')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  price_override numeric(10, 2),
  unique (product_id, size)
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);

-- ---------- orders ----------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,
  user_id          uuid references public.profiles (id) on delete set null,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  shipping_address jsonb not null,
  payment_method   text not null default 'COD' check (payment_method in ('COD', 'Card')),
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  order_status     text not null default 'pending' check (order_status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount     numeric(10, 2) not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (order_status);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ---------- order_items ----------
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  quantity   integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- Helper: is the current user an admin? ----------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Bootstrap a profile row on new auth user ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
