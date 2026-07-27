"use client";

import { useEffect, useRef } from "react";

import { getVariantCartPricing } from "@/lib/actions/cart";
import { useCart } from "@/store/cart";

/** Re-fetch live catalog prices into the persisted cart (fixes unitPrice 0). */
export function useSyncCartPricing(enabled = true) {
  const items = useCart((s) => s.items);
  const syncPricing = useCart((s) => s.syncPricing);
  const syncedKey = useRef<string>("");

  const variantKey = items
    .map((i) => i.variantId)
    .sort()
    .join("|");

  useEffect(() => {
    if (!enabled || !variantKey) return;
    if (syncedKey.current === variantKey) return;

    let cancelled = false;
    syncedKey.current = variantKey;

    void (async () => {
      const ids = variantKey.split("|").filter(Boolean);
      const pricing = await getVariantCartPricing(ids);
      if (cancelled || pricing.length === 0) return;
      syncPricing(pricing);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, variantKey, syncPricing]);
}
