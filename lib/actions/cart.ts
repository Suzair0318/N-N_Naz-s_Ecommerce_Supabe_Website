"use server";

import { resolveUnitPrice } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

export type VariantCartPricing = {
  variantId: string;
  unitPrice: number;
  maxStock: number;
  weightGrams: number;
};

/**
 * Live catalog prices for cart lines. Used to repair stale localStorage
 * carts that stored unitPrice 0 from empty price_override fields.
 */
export async function getVariantCartPricing(
  variantIds: string[]
): Promise<VariantCartPricing[]> {
  const ids = [...new Set(variantIds.filter(Boolean))];
  if (ids.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, price_override, stock_quantity, product:products(base_price, discount_price, weight)"
    )
    .in("id", ids);

  if (error) {
    console.error("[cart] getVariantCartPricing failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return {
      variantId: row.id,
      unitPrice: resolveUnitPrice(
        row.price_override,
        product?.discount_price,
        product?.base_price
      ),
      maxStock: row.stock_quantity ?? 0,
      weightGrams:
        product?.weight != null && Number.isFinite(Number(product.weight))
          ? Number(product.weight)
          : 0,
    };
  });
}
