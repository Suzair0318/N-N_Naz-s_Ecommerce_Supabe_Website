"use server";

import { sendOrderEmails } from "@/lib/email/send-order-emails";
import { resolveUnitPrice } from "@/lib/pricing";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  placeOrderSchema,
  type PlaceOrderInput,
} from "@/lib/validators/checkout";

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

function mapOrderError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("insufficient stock")) {
    return "One or more items are no longer in stock. Update your bag and try again.";
  }
  if (msg.includes("not found")) {
    return "An item in your bag is no longer available. Clear your bag and add it again.";
  }
  if (msg.includes("shipping city")) {
    return "Please select a valid delivery city.";
  }
  if (msg.includes("invalid payment")) {
    return "Please choose Cash on Delivery.";
  }
  if (msg.includes("foreign key") || msg.includes("profiles")) {
    return "Your account profile is incomplete. Sign out, sign in again, then retry.";
  }
  if (msg.includes("could not find the function") || msg.includes("schema cache")) {
    return "Ordering is temporarily unavailable. Please try again shortly.";
  }
  return "We couldn't place your order. Please try again.";
}

/**
 * Aligns order line prices with catalog rules after create_order.
 * Covers legacy RPC bugs (price_override 0, discount_price > base_price).
 */
async function syncOrderItemPricesFromCatalog(orderId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: items, error } = await admin
      .from("order_items")
      .select(
        "id, quantity, unit_price, variant:product_variants(price_override, product:products(base_price, discount_price))"
      )
      .eq("order_id", orderId);

    if (error || !items?.length) return;

    let subtotal = 0;
    let changed = false;

    for (const item of items) {
      const variant = Array.isArray(item.variant)
        ? item.variant[0]
        : item.variant;
      const product = Array.isArray(variant?.product)
        ? variant?.product[0]
        : variant?.product;
      const live = resolveUnitPrice(
        variant?.price_override,
        product?.discount_price,
        product?.base_price
      );
      if (!(live > 0)) {
        subtotal += Number(item.unit_price) * item.quantity;
        continue;
      }

      const current = Number(item.unit_price);
      if (current !== live) {
        changed = true;
        await admin
          .from("order_items")
          .update({ unit_price: live })
          .eq("id", item.id);
      }
      subtotal += live * item.quantity;
    }

    if (!changed && !(subtotal > 0)) return;

    const { data: order } = await admin
      .from("orders")
      .select("shipping_address, total_amount")
      .eq("id", orderId)
      .maybeSingle();

    const shippingRaw = order?.shipping_address as
      | { shipping_fee?: number | string }
      | null;
    const shippingFee =
      typeof shippingRaw?.shipping_fee === "number"
        ? shippingRaw.shipping_fee
        : Number(shippingRaw?.shipping_fee) || 0;
    const nextTotal = subtotal + shippingFee;

    if (changed || Number(order?.total_amount) !== nextTotal) {
      await admin
        .from("orders")
        .update({ total_amount: nextTotal })
        .eq("id", orderId);
    }
  } catch (err) {
    console.error(
      "[orders] syncOrderItemPricesFromCatalog failed:",
      err instanceof Error ? err.message : err
    );
  }
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

  // orders.user_id references profiles(id). Ensure a profile row exists
  // for signed-in users so the FK insert cannot fail.
  let userId: string | null = user?.id ?? null;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email: user?.email ?? data.customerEmail,
        full_name: data.customerName,
        role: "customer",
      });

      if (profileError) {
        console.error(
          "[orders] profile bootstrap failed:",
          profileError.message
        );
        // Still allow guest-style checkout rather than blocking the sale.
        userId = null;
      }
    }
  }

  const variantIds = data.items.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity")
    .in("id", variantIds);

  if (variantsError) {
    console.error("[orders] variant lookup failed:", variantsError.message);
    return {
      success: false,
      error: "We couldn't verify your bag items. Please try again.",
    };
  }

  const byId = new Map((variants ?? []).map((v) => [v.id, v]));
  for (const item of data.items) {
    const row = byId.get(item.variantId);
    if (!row) {
      return {
        success: false,
        error:
          "An item in your bag is no longer available. Clear your bag and add products again.",
      };
    }
    if (row.stock_quantity < item.quantity) {
      return {
        success: false,
        error:
          "One or more items are no longer in stock. Update your bag and try again.",
      };
    }
  }

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
    p_user_id: userId,
    p_items: data.items.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
    })),
  });

  if (error) {
    console.error(
      "[orders] placeOrder RPC failed:",
      error.message,
      error.details,
      error.hint,
      error.code
    );
    return {
      success: false,
      error: mapOrderError(error.message),
    };
  }

  const row = Array.isArray(result) ? result[0] : result;
  if (!row?.order_id) {
    return { success: false, error: "Order could not be created." };
  }

  await syncOrderItemPricesFromCatalog(row.order_id);

  // Customer + admin Gmail notifications (non-blocking for checkout).
  await sendOrderEmails(row.order_id);

  return {
    success: true,
    orderId: row.order_id,
    orderNumber: row.order_number,
  };
}
