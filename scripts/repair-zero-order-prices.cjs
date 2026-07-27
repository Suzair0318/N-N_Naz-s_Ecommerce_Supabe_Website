const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};

function resolveUnitPrice(priceOverride, discountPrice, basePrice) {
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

async function main() {
  const sb = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });

  const { data: items, error } = await sb
    .from("order_items")
    .select(
      "id, order_id, quantity, unit_price, variant:product_variants(price_override, product:products(base_price, discount_price))"
    )
    .lte("unit_price", 0);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("zero-priced order items:", (items || []).length);
  const touchedOrders = new Set();

  for (const item of items || []) {
    const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
    const product = Array.isArray(variant?.product)
      ? variant?.product[0]
      : variant?.product;
    const next = resolveUnitPrice(
      variant?.price_override,
      product?.discount_price,
      product?.base_price
    );
    if (!(next > 0)) {
      console.warn("could not resolve price for", item.id);
      continue;
    }
    const { error: uerr } = await sb
      .from("order_items")
      .update({ unit_price: next })
      .eq("id", item.id);
    if (uerr) {
      console.error("update item", item.id, uerr);
      continue;
    }
    touchedOrders.add(item.order_id);
    console.log("fixed item", item.id, "->", next);
  }

  for (const orderId of touchedOrders) {
    const { data: lines } = await sb
      .from("order_items")
      .select("unit_price, quantity")
      .eq("order_id", orderId);
    const { data: order } = await sb
      .from("orders")
      .select("shipping_address")
      .eq("id", orderId)
      .maybeSingle();
    const subtotal = (lines || []).reduce(
      (s, l) => s + Number(l.unit_price) * l.quantity,
      0
    );
    const shipping =
      typeof order?.shipping_address?.shipping_fee === "number"
        ? order.shipping_address.shipping_fee
        : Number(order?.shipping_address?.shipping_fee) || 0;
    await sb
      .from("orders")
      .update({ total_amount: subtotal + shipping })
      .eq("id", orderId);
    console.log("fixed order total", orderId, subtotal + shipping);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
