import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category, StorefrontCategory } from "@/lib/types";

export type { StorefrontCategory };

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[categories] getCategories failed:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Categories for the homepage grid. Includes active product counts and
 * falls back to a product image when category.image_url is missing.
 */
export async function getCategoriesForStorefront(): Promise<
  StorefrontCategory[]
> {
  const categories = await getCategories();
  if (categories.length === 0) return [];

  const supabase = createClient();
  const categoryIds = categories.map((c) => c.id);

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "category_id, images:product_images(image_url, display_order)"
    )
    .in("category_id", categoryIds)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[categories] storefront category lookup failed:",
      error.message
    );
    return categories.map((c) => ({ ...c, productCount: 0 }));
  }

  const countByCategory = new Map<string, number>();
  const coverByCategory = new Map<string, string>();

  for (const product of products ?? []) {
    if (!product.category_id) continue;

    countByCategory.set(
      product.category_id,
      (countByCategory.get(product.category_id) ?? 0) + 1
    );

    if (coverByCategory.has(product.category_id)) continue;

    const rawImages = product.images as unknown as
      | { image_url: string; display_order: number }[]
      | null
      | undefined;
    const images = [...(rawImages ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    );
    const url = images[0]?.image_url;
    if (url) coverByCategory.set(product.category_id, url);
  }

  return categories.map((c) => ({
    ...c,
    image_url: c.image_url ?? coverByCategory.get(c.id) ?? null,
    productCount: countByCategory.get(c.id) ?? 0,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[categories] getCategoryBySlug failed:", error.message);
    return null;
  }
  return data;
}
