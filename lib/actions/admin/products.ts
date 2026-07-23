"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { productSchema, type ProductFormValues } from "@/lib/validators/product";

interface ActionResult {
  success: boolean;
  productId?: string;
  error?: string;
}

async function persistImagesAndVariants(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
  data: ProductFormValues
) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_variants").delete().eq("product_id", productId);

  if (data.images.length > 0) {
    await supabase.from("product_images").insert(
      data.images.map((url, index) => ({
        product_id: productId,
        image_url: url,
        display_order: index,
      }))
    );
  }

  await supabase.from("product_variants").insert(
    data.variants.map((v) => ({
      product_id: productId,
      size: v.size,
      stock_quantity: v.stock_quantity,
      price_override: v.price_override ?? null,
    }))
  );
}

export async function createProduct(
  input: ProductFormValues
): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }
  const data = parsed.data;
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      brand_name: data.brand_name,
      weight: data.weight ?? null,
      category_id: data.category_id ?? null,
      base_price: data.base_price,
      discount_price: data.discount_price ?? null,
      featured: data.featured,
      is_active: data.is_active,
    })
    .select("id")
    .single();

  if (error || !product) {
    console.error("[admin] createProduct failed:", error?.message);
    return {
      success: false,
      error: error?.message.includes("duplicate")
        ? "A product with this slug already exists"
        : "Could not create product",
    };
  }

  await persistImagesAndVariants(supabase, product.id, data);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, productId: product.id };
}

export async function updateProduct(
  productId: string,
  input: ProductFormValues
): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }
  const data = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      brand_name: data.brand_name,
      weight: data.weight ?? null,
      category_id: data.category_id ?? null,
      base_price: data.base_price,
      discount_price: data.discount_price ?? null,
      featured: data.featured,
      is_active: data.is_active,
    })
    .eq("id", productId);

  if (error) {
    console.error("[admin] updateProduct failed:", error.message);
    return { success: false, error: "Could not update product" };
  }

  await persistImagesAndVariants(supabase, productId, data);

  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/shop");
  return { success: true, productId };
}

export async function deleteProduct(
  productId: string
): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("[admin] deleteProduct failed:", error.message);
    return { success: false, error: "Could not delete product" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}
