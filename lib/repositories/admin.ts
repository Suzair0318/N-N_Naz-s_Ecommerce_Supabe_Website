import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Order, Product, ProductVariant } from "@/lib/types";

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

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] getAllOrders failed:", error.message);
    return [];
  }
  return data ?? [];
}

export type AdminProductRow = Product & {
  category: { name: string } | null;
  variants: Pick<ProductVariant, "stock_quantity">[];
};

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name), variants:product_variants(stock_quantity)")
    .order("created_at", { ascending: false });

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
