"use server";

import { createClient } from "@/lib/supabase/server";
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/validators/checkout";

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * Creates an order transactionally via the create_order RPC.
 * Prices are resolved server-side; stock is validated and decremented
 * atomically. Works for both guest and authenticated checkout.
 */
export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid order details",
    };
  }

  const data = parsed.data;
  const resolvedCity =
    data.city === "Other"
      ? (data.cityOther ?? "").trim()
      : data.city.trim();

  if (!resolvedCity) {
    return { success: false, error: "Please select or enter your city." };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: result, error } = await supabase.rpc("create_order", {
    p_customer_name: data.customerName,
    p_customer_email: data.customerEmail,
    p_customer_phone: data.customerPhone,
    p_shipping_address: {
      address: data.address,
      city: resolvedCity,
      postal_code: data.postalCode,
      country: data.country,
    },
    p_payment_method: data.paymentMethod,
    p_user_id: user?.id ?? null,
    p_items: data.items.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
    })),
  });

  if (error) {
    console.error("[orders] placeOrder RPC failed:", error.message);
    return {
      success: false,
      error:
        error.message.includes("Insufficient stock")
          ? "One or more items are no longer in stock."
          : "We couldn't place your order. Please try again.",
    };
  }

  const row = Array.isArray(result) ? result[0] : result;
  if (!row?.order_id) {
    return { success: false, error: "Order could not be created." };
  }

  return {
    success: true,
    orderId: row.order_id,
    orderNumber: row.order_number,
  };
}
