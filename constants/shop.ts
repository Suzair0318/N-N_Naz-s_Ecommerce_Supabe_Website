/** Storefront-wide commerce constants. */

/**
 * Base shipping for the first 1 kg (PKR).
 * Each additional kg adds half of the base rate.
 * Example (Karachi): 1kg=350, 2kg=525, 3kg=700
 */
export const SHIPPING_KARACHI = 350;
export const SHIPPING_OTHER = 450;

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Other",
] as const;

export type PakistanCity = (typeof PAKISTAN_CITIES)[number];

export const SIZES = ["XS", "S", "M", "L", "XL", "Custom"] as const;
export const CURRENCY = "PKR";

/** Base rate by city (1st kg). */
export function getBaseShippingFee(city: string | null | undefined): number {
  if (!city) return SHIPPING_OTHER;
  return city.trim().toLowerCase() === "karachi"
    ? SHIPPING_KARACHI
    : SHIPPING_OTHER;
}

/**
 * Billable weight brackets in whole kg.
 * 0–1000g → 1kg, 1001–2000g → 2kg, etc.
 * Empty/unknown weight still bills as 1kg when charging.
 */
export function getBillableKg(weightGrams: number): number {
  const grams = Math.max(0, Number(weightGrams) || 0);
  if (grams <= 0) return 1;
  return Math.ceil(grams / 1000);
}

/**
 * Weight-tier shipping:
 * fee = base + (billableKg - 1) * (base / 2)
 */
export function getShippingFee(
  city: string | null | undefined,
  weightGrams = 0
): number {
  const base = getBaseShippingFee(city);
  const units = getBillableKg(weightGrams);
  return base + (units - 1) * (base / 2);
}

/** Human-readable kg label from grams (e.g. 1500 → "1.5 kg"). */
export function formatWeightKg(weightGrams: number): string {
  const kg = Math.max(0, Number(weightGrams) || 0) / 1000;
  const rounded = Math.round(kg * 1000) / 1000;
  return `${rounded} kg`;
}
