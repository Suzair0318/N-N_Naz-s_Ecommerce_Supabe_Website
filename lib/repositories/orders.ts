import "server-only";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/lib/types";

const ORDER_SELECT =
  "*, items:order_items(*, product:products(title, slug), variant:product_variants(size))";

function hasRealServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && !key.includes("placeholder"));
}

/**
 * Fetches an order for the post-checkout confirmation page.
 * Works for guests without the service_role key via get_order_confirmation RPC.
 */
export async function getOrderForConfirmation(
  orderId: string
): Promise<OrderWithItems | null> {
  const supabase = createClient();

  // 1) Prefer RPC (works for guest + logged-in; no service role needed).
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_order_confirmation",
    { p_order_id: orderId }
  );

  if (!rpcError && rpcData) {
    return rpcData as unknown as OrderWithItems;
  }

  if (rpcError) {
    console.error(
      "[orders] get_order_confirmation RPC failed:",
      rpcError.message
    );
  }

  // 2) Authenticated owner can read via RLS.
  const { data: owned, error: ownedError } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (!ownedError && owned) {
    return owned as unknown as OrderWithItems;
  }

  // 3) Optional admin client fallback (only if a real service role key is set).
  if (hasRealServiceRoleKey()) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("orders")
        .select(ORDER_SELECT)
        .eq("id", orderId)
        .maybeSingle();

      if (error) {
        console.error(
          "[orders] getOrderForConfirmation admin failed:",
          error.message
        );
        return null;
      }
      return (data as unknown as OrderWithItems) ?? null;
    } catch (err) {
      console.error("[orders] admin client unavailable:", err);
    }
  }

  return null;
}

export async function getOrderById(
  orderId: string
): Promise<OrderWithItems | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("[orders] getOrderById failed:", error.message);
    return null;
  }
  return (data as unknown as OrderWithItems) ?? null;
}

export async function getOrdersForUser(
  userId: string
): Promise<OrderWithItems[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] getOrdersForUser failed:", error.message);
    return [];
  }
  return (data as unknown as OrderWithItems[]) ?? [];
}
