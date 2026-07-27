/** Resolve the selling unit price for a product variant. */

/**
 * Selling price rules (aligned with storefront Price display):
 * 1. Positive variant override wins.
 * 2. Else discount wins only when it is lower than base (a real sale).
 * 3. Else base price.
 *
 * Empty admin "Price override" fields often coerce to 0 — treat that as unused.
 */
export function resolveUnitPrice(
  priceOverride: number | null | undefined,
  discountPrice: number | null | undefined,
  basePrice: number | null | undefined
): number {
  const override = Number(priceOverride);
  if (Number.isFinite(override) && override > 0) return override;

  const base = Number(basePrice);
  const safeBase = Number.isFinite(base) && base > 0 ? base : 0;

  const discount = Number(discountPrice);
  if (
    Number.isFinite(discount) &&
    discount > 0 &&
    (safeBase <= 0 || discount < safeBase)
  ) {
    return discount;
  }

  return safeBase;
}
