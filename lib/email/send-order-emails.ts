import "server-only";

import {
  getAdminOrderEmails,
  getEmailFrom,
  getMailTransporter,
} from "@/lib/email/client";
import {
  buildAdminOrderEmail,
  buildCustomerOrderEmail,
} from "@/lib/email/templates";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/lib/types";

const ORDER_SELECT =
  "*, items:order_items(*, product:products(title, slug), variant:product_variants(size))";

async function loadOrderForEmail(
  orderId: string
): Promise<OrderWithItems | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey && !serviceKey.includes("placeholder")) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("orders")
        .select(ORDER_SELECT)
        .eq("id", orderId)
        .maybeSingle();
      if (!error && data) {
        return data as unknown as OrderWithItems;
      }
      if (error) {
        console.error("[email] admin order load failed:", error.message);
      }
    } catch (err) {
      console.error(
        "[email] admin client unavailable:",
        err instanceof Error ? err.message : err
      );
    }
  }

  const supabase = createClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_order_confirmation",
    { p_order_id: orderId }
  );
  if (!rpcError && rpcData) {
    return rpcData as unknown as OrderWithItems;
  }
  if (rpcError) {
    console.error("[email] get_order_confirmation failed:", rpcError.message);
  }
  return null;
}

/**
 * Sends customer confirmation + admin alert after a successful order.
 * Uses Gmail SMTP — no custom domain required.
 * Failures are logged only — they must never block checkout.
 */
export async function sendOrderEmails(orderId: string): Promise<void> {
  try {
    const mailer = getMailTransporter();
    if (!mailer) {
      console.warn(
        "[email] SMTP_USER / SMTP_PASS missing — skipped order emails for",
        orderId
      );
      return;
    }

    const order = await loadOrderForEmail(orderId);
    if (!order) {
      console.error("[email] order not found for notifications:", orderId);
      return;
    }

    const from = getEmailFrom();
    const customer = buildCustomerOrderEmail(order);
    const admin = buildAdminOrderEmail(order);
    const adminEmails = getAdminOrderEmails();

    const sends: Promise<unknown>[] = [
      mailer
        .sendMail({
          from,
          to: order.customer_email,
          subject: customer.subject,
          html: customer.html,
        })
        .catch((err: unknown) => {
          console.error(
            "[email] customer confirmation failed:",
            err instanceof Error ? err.message : err
          );
        }),
    ];

    if (adminEmails.length > 0) {
      sends.push(
        mailer
          .sendMail({
            from,
            to: adminEmails.join(", "),
            subject: admin.subject,
            html: admin.html,
          })
          .catch((err: unknown) => {
            console.error(
              "[email] admin notification failed:",
              err instanceof Error ? err.message : err
            );
          })
      );
    } else {
      console.warn(
        "[email] ADMIN_ORDER_EMAIL missing — skipped admin notification"
      );
    }

    await Promise.all(sends);
  } catch (err) {
    console.error(
      "[email] sendOrderEmails failed:",
      err instanceof Error ? err.message : err
    );
  }
}
