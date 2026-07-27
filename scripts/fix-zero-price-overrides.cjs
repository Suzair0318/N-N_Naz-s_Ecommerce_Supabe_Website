const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("missing env");
  process.exit(1);
}

async function main() {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: before, error: e1 } = await sb
    .from("product_variants")
    .select("id, price_override")
    .not("price_override", "is", null);
  if (e1) {
    console.error("select", e1);
    process.exit(1);
  }
  const zeros = (before || []).filter((v) => Number(v.price_override) <= 0);
  console.log(
    "variants with override:",
    (before || []).length,
    "zeros:",
    zeros.length
  );
  if (zeros.length) {
    const { error: e2 } = await sb
      .from("product_variants")
      .update({ price_override: null })
      .lte("price_override", 0);
    if (e2) {
      console.error("update", e2);
      process.exit(1);
    }
    console.log("cleared zero overrides");
  }
  const { data: products } = await sb
    .from("products")
    .select("id,title,base_price,discount_price")
    .limit(5);
  console.log("sample products", products);
  const { data: variants } = await sb
    .from("product_variants")
    .select("id, price_override, product_id")
    .limit(5);
  console.log("sample variants", variants);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
