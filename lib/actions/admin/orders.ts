"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserAdmin } from "@/lib/auth";
import { createPrivilegedClient } from "@/lib/supabase/server";
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed"];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }
  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const supabase = createPrivilegedClient();
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId);

  if (error) {
    console.error("[admin] updateOrderStatus failed:", error.message);
    return { success: false, error: "Could not update order status" };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }
  if (!PAYMENT_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const supabase = createPrivilegedClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status })
    .eq("id", orderId);

  if (error) {
    console.error("[admin] updatePaymentStatus failed:", error.message);
    return { success: false, error: "Could not update payment status" };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function deleteOrders(
  orderIds: string[]
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const ids = [...new Set(orderIds.filter(Boolean))];
  if (ids.length === 0) {
    return { success: false, error: "No orders selected" };
  }

  const supabase = createPrivilegedClient();
  const { data, error } = await supabase
    .from("orders")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) {
    console.error("[admin] deleteOrders failed:", error.message);
    return {
      success: false,
      error: "Could not delete order(s). Please try again.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  revalidatePath("/account");

  return { success: true, deleted: data?.length ?? ids.length };
}
