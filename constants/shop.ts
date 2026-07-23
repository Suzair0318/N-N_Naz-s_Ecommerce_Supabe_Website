/** Storefront-wide commerce constants. */

/** Shipping by delivery city (PKR). */
export const SHIPPING_KARACHI = 350;
export const SHIPPING_OTHER = 400;

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

/** Case-insensitive: Karachi → 350, every other city → 400. */
export function getShippingFee(city: string | null | undefined): number {
  if (!city) return SHIPPING_OTHER;
  return city.trim().toLowerCase() === "karachi"
    ? SHIPPING_KARACHI
    : SHIPPING_OTHER;
}
