import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Order, Product, ProductImage, ProductVariant } from "@/lib/types";

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  lowStockCount: number;
  customerCount: number;
}

const LOW_STOCK_THRESHOLD = 3;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();

  const [ordersRes, customersRes, lowStockRes] = await Promise.all([
    supabase.from("orders").select("total_amount, order_status"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .lte("stock_quantity", LOW_STOCK_THRESHOLD),
  ]);

  const orders = ordersRes.data ?? [];
  const totalSales = orders
    .filter((o) => o.order_status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return {
    totalSales,
    totalOrders: orders.length,
    lowStockCount: lowStockRes.count ?? 0,
    customerCount: customersRes.count ?? 0,
  };
}

export async function getRecentOrders(limit = 8): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin] getRecentOrders failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAllOrders(search?: string): Promise<Order[]> {
  const supabase = createClient();
  const q = search?.trim() ?? "";

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    // PostgREST: quote values that contain % / special filter chars
    const escaped = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const pattern = `"%${escaped}%"`;
    const filters = [
      `order_number.ilike.${pattern}`,
      `customer_email.ilike.${pattern}`,
      `customer_name.ilike.${pattern}`,
    ];

    // Exact UUID match when the query looks like an order id
    const uuidLike =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        q
      );
    if (uuidLike) {
      filters.push(`id.eq.${q}`);
    }

    query = query.or(filters.join(","));
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin] getAllOrders failed:", error.message);
    return [];
  }
  return data ?? [];
}

export type AdminProductRow = Product & {
  category: { name: string } | null;
  variants: Pick<ProductVariant, "stock_quantity">[];
  images: Pick<ProductImage, "image_url" | "display_order">[];
};

export async function getAdminProducts(
  search?: string
): Promise<AdminProductRow[]> {
  const supabase = createClient();
  const q = search?.trim() ?? "";

  let query = supabase
    .from("products")
    .select(
      "*, category:categories(name), variants:product_variants(stock_quantity), images:product_images(image_url, display_order)"
    )
    .order("created_at", { ascending: false });

  if (q) {
    const escaped = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const pattern = `"%${escaped}%"`;
    const filters = [
      `title.ilike.${pattern}`,
      `brand_name.ilike.${pattern}`,
      `description.ilike.${pattern}`,
      `slug.ilike.${pattern}`,
    ];

    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", `%${q}%`);

    const categoryIds = (categories ?? []).map((c) => c.id);
    if (categoryIds.length > 0) {
      filters.push(`category_id.in.(${categoryIds.join(",")})`);
    }

    query = query.or(filters.join(","));
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin] getAdminProducts failed:", error.message);
    return [];
  }
  return (data as unknown as AdminProductRow[]) ?? [];
}

export async function getAdminProductById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getAdminProductById failed:", error.message);
    return null;
  }
  return data;
}
