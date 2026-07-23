# Naz's Collection — Women's Clothing

An ultra-luxurious, modern fashion e-commerce platform built with **Next.js 14 (App Router)**, **Supabase**, **Tailwind CSS**, **Framer Motion**, and **Zustand**.

## Tech Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Framework        | Next.js 14 (App Router, RSC, TypeScript)               |
| Styling / UI     | Tailwind CSS, shadcn-style Radix primitives, Lucide    |
| Animation        | Framer Motion                                          |
| Backend / DB     | Supabase (PostgreSQL, Auth, RLS, Storage)              |
| State            | Zustand (cart + wishlist, persisted)                   |
| Forms/Validation | React Hook Form + Zod                                  |

## Design System

| Token           | Value     | Usage                        |
| --------------- | --------- | ---------------------------- |
| Pure White      | `#FFFFFF` | Primary background           |
| Off-White       | `#FAFAFA` | Soft surfaces                |
| Charcoal        | `#121212` | Text, headings, primary CTAs |
| Royal Gold      | `#D4AF37` | Accent / highlights          |
| Silver          | `#C0C0C0` | Secondary accent             |
| Pale Silver     | `#E0E0E0` | Borders / dividers           |

Typography: **Playfair Display** (serif headings) + **Inter** (sans-serif UI/body).

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings -> API**, copy the Project URL, `anon` public key, and `service_role` key.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Run database migrations

Open the Supabase **SQL Editor** and run the files in order:

1. `supabase/migrations/0001_init.sql` — tables & triggers
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies
3. `supabase/migrations/0003_storage.sql` — `product-images` bucket & policies
4. `supabase/seed.sql` — optional demo data

> Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db push`.

### 5. Create an admin user

1. Sign up through the app (`/register`) or the Supabase Auth dashboard.
2. In the SQL editor, promote the user:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 6. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Admin panel lives at [/admin](http://localhost:3000/admin).

## Project Structure

```
app/
  (store)/            Customer storefront (home, shop, product, checkout, order-success)
  admin/              Admin dashboard, products, orders (role-protected)
  (auth)/             Login / register
components/           Layout, product, cart, and UI primitives
lib/
  supabase/           Browser + server clients, middleware helper, DB types
  repositories/       Repository-pattern data access
  actions/            Server actions (orders, admin mutations)
  validators/         Zod schemas
store/                Zustand stores (cart, wishlist)
constants/            Brand color tokens
supabase/migrations/  SQL migration scripts
```

## Payments

Cash on Delivery (COD) is fully functional. The **Card** option renders its UI but is a clearly-marked stub — wire in a provider (e.g. Stripe) before going live.

## Security Notes

- Secrets are read from environment variables; nothing is hardcoded.
- The `service_role` key is used **only** in server-side code.
- All tables are protected with Row Level Security; admin-only writes are enforced in the database.
