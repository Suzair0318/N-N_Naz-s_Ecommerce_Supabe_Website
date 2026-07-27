import {
  CheckoutClient,
  type CheckoutDefaults,
} from "@/app/(store)/checkout/checkout-client";
import { PAKISTAN_CITIES } from "@/constants/shop";
import { getCurrentProfile } from "@/lib/auth";

export const metadata = { title: "Checkout" };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function defaultsFromProfile(
  profile: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>
): CheckoutDefaults {
  const addr = (profile.address ?? {}) as Record<string, unknown>;
  const cityRaw = str(addr.city);
  const known = (PAKISTAN_CITIES as readonly string[]).includes(cityRaw);
  const city = known ? cityRaw : cityRaw ? "Other" : "Karachi";

  return {
    customerName: profile.full_name ?? "",
    customerEmail: profile.email ?? "",
    customerPhone: profile.phone ?? str(addr.phone),
    address: str(addr.address) || str(addr.street),
    city,
    cityOther: city === "Other" ? cityRaw : "",
    postalCode: str(addr.postal_code) || str(addr.postalCode),
    country: str(addr.country) || "Pakistan",
  };
}

export default async function CheckoutPage() {
  const profile = await getCurrentProfile();
  const defaults = profile ? defaultsFromProfile(profile) : undefined;

  return <CheckoutClient defaults={defaults} />;
}
