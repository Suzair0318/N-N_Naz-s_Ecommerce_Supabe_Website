"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
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

  const supabase = createAdminClient();
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

  const supabase = createAdminClient();
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
