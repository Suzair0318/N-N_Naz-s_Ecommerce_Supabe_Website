import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

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
 * Categories for the homepage grid. When a category has no image_url,
 * use the first active product image in that category as a cover.
 */
export async function getCategoriesForStorefront(): Promise<Category[]> {
  const categories = await getCategories();
  if (categories.length === 0) return [];

  const missing = categories.filter((c) => !c.image_url);
  if (missing.length === 0) return categories;

  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select(
      "category_id, images:product_images(image_url, display_order)"
    )
    .in(
      "category_id",
      missing.map((c) => c.id)
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[categories] cover image lookup failed:",
      error.message
    );
    return categories;
  }

  const coverByCategory = new Map<string, string>();
  for (const product of products ?? []) {
    if (!product.category_id || coverByCategory.has(product.category_id)) {
      continue;
    }
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

  return categories.map((c) =>
    c.image_url
      ? c
      : {
          ...c,
          image_url: coverByCategory.get(c.id) ?? null,
        }
  );
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
