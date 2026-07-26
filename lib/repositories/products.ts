import "server-only";

import { PRICE_FILTER_MAX } from "@/constants/shop";
import { createClient } from "@/lib/supabase/server";
import type {
  ProductCardData,
  ProductWithRelations,
  ShopFilters,
} from "@/lib/types";

const CARD_SELECT =
  "*, images:product_images(image_url, display_order), variants:product_variants(id, size, stock_quantity, price_override)";

const FULL_SELECT =
  "*, category:categories(id, name, slug), images:product_images(*), variants:product_variants(*)";

export async function getFeaturedProducts(
  limit = 8
): Promise<ProductCardData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[products] getFeaturedProducts failed:", error.message);
    return [];
  }
  return (data as unknown as ProductCardData[]) ?? [];
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[products] getNewArrivals failed:", error.message);
    return [];
  }
  return (data as unknown as ProductCardData[]) ?? [];
}

export async function getProductsByFilters(
  filters: ShopFilters
): Promise<ProductCardData[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true);

  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (cat?.id) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters.brands?.length) {
    query = query.in("brand_name", filters.brands);
  }

  // Price filtering is applied after fetch using selling price
  // (discount_price ?? base_price) so it matches shop card prices.

  switch (filters.sort) {
    case "price-asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("base_price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("[products] getProductsByFilters failed:", error.message);
    return [];
  }

  let products = (data as unknown as ProductCardData[]) ?? [];

  // Price filter uses the selling price shown on cards (discount if set).
  if (typeof filters.maxPrice === "number") {
    products = products.filter((p) => {
      const price = Number(p.discount_price ?? p.base_price);
      return price <= filters.maxPrice!;
    });
  }
  if (typeof filters.minPrice === "number") {
    products = products.filter((p) => {
      const price = Number(p.discount_price ?? p.base_price);
      return price >= filters.minPrice!;
    });
  }

  // Variant-derived filters are applied in-memory (nested filtering on
  // related rows is limited via PostgREST).
  if (filters.sizes?.length) {
    const wanted = new Set(filters.sizes);
    products = products.filter((p) =>
      p.variants.some((v) => wanted.has(v.size))
    );
  }
  if (filters.inStock) {
    products = products.filter((p) =>
      p.variants.some((v) => v.stock_quantity > 0)
    );
  }

  return products;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(FULL_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[products] getProductBySlug failed:", error.message);
    return null;
  }
  if (!data) return null;

  const product = data as unknown as ProductWithRelations;
  product.images = [...product.images].sort(
    (a, b) => a.display_order - b.display_order
  );
  return product;
}

export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  return { min: 0, max: PRICE_FILTER_MAX };
}

/** Distinct brand names from active products (sorted). */
export async function getProductBrands(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("brand_name")
    .eq("is_active", true)
    .not("brand_name", "is", null);

  if (error) {
    console.error("[products] getProductBrands failed:", error.message);
    return [];
  }

  const brands = new Set<string>();
  for (const row of data ?? []) {
    const name = row.brand_name?.trim();
    if (name) brands.add(name);
  }
  return Array.from(brands).sort((a, b) => a.localeCompare(b));
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((p) => p.slug);
}
