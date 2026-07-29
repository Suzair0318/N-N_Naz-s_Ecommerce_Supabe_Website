import "server-only";

import { formatPrice } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://nazs-collection.vercel.app"
  );
}

function orderItemsRows(order: OrderWithItems) {
  return order.items
    .map((item) => {
      const title = escapeHtml(item.product?.title ?? "Item");
      const size = item.variant?.size
        ? ` · Size ${escapeHtml(item.variant.size)}`
        : "";
      const line = Number(item.unit_price) * item.quantity;
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">
          <strong>${title}</strong><br/>
          <span style="color:#666;">Qty ${item.quantity}${size}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;">
          ${escapeHtml(formatPrice(line))}
        </td>
      </tr>`;
    })
    .join("");
}

function shippingBlock(order: OrderWithItems) {
  const a = order.shipping_address;
  return `${escapeHtml(order.customer_name)}<br/>
    ${escapeHtml(a.address)}<br/>
    ${escapeHtml(a.city)}, ${escapeHtml(a.postal_code)}<br/>
    ${escapeHtml(a.country)}${
      order.customer_phone
        ? `<br/>Phone: ${escapeHtml(order.customer_phone)}`
        : ""
    }`;
}

function totalsBlock(order: OrderWithItems) {
  const shippingFee =
    typeof order.shipping_address.shipping_fee === "number"
      ? order.shipping_address.shipping_fee
      : null;
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  return `
    <p style="margin:4px 0;font-size:14px;">
      <span style="color:#666;">Subtotal:</span>
      ${escapeHtml(formatPrice(subtotal))}
    </p>
    ${
      shippingFee != null
        ? `<p style="margin:4px 0;font-size:14px;">
            <span style="color:#666;">Shipping:</span>
            ${escapeHtml(formatPrice(shippingFee))}
          </p>`
        : ""
    }
    <p style="margin:12px 0 0;font-size:18px;font-weight:600;">
      Total: ${escapeHtml(formatPrice(Number(order.total_amount)))}
    </p>
  `;
}

function shell(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b89b5a;">
      N&amp;N Naz's Collection
    </p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:400;">${escapeHtml(title)}</h1>
    <div style="background:#fff;padding:24px;border:1px solid #e8e4de;">
      ${body}
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#888;">
      This is an automated message from Naz's Collection.
    </p>
  </div>
</body>
</html>`;
}

export function buildCustomerOrderEmail(order: OrderWithItems) {
  const payment =
    order.payment_method === "COD" ? "Cash on Delivery" : "Card / Online";
  const confirmUrl = `${siteUrl()}/order-success/${order.id}`;

  const html = shell(
    "Order confirmation",
    `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
        Hi ${escapeHtml(order.customer_name)}, thanks for your order.
        We have received it and will process it shortly.
      </p>
      <p style="margin:0 0 20px;font-size:14px;">
        Order <strong>${escapeHtml(order.order_number)}</strong>
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${orderItemsRows(order)}
      </table>
      <div style="margin-top:20px;">
        ${totalsBlock(order)}
      </div>
      <p style="margin:20px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#888;">
        Shipping to
      </p>
      <p style="margin:0;font-size:14px;line-height:1.5;">${shippingBlock(order)}</p>
      <p style="margin:16px 0 0;font-size:14px;">
        Payment: ${escapeHtml(payment)}
      </p>
      <p style="margin:24px 0 0;">
        <a href="${escapeHtml(confirmUrl)}"
           style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 20px;font-size:13px;">
          View order details
        </a>
      </p>
    `
  );

  return {
    subject: `Order confirmed · ${order.order_number}`,
    html,
  };
}

export function buildAdminOrderEmail(order: OrderWithItems) {
  const payment =
    order.payment_method === "COD" ? "Cash on Delivery" : "Card / Online";
  const adminUrl = `${siteUrl()}/admin/orders`;

  const html = shell(
    "New order received",
    `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
        A new order was placed on Naz's Collection.
      </p>
      <p style="margin:0 0 8px;font-size:14px;">
        Order <strong>${escapeHtml(order.order_number)}</strong>
      </p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.5;">
        Customer: ${escapeHtml(order.customer_name)}<br/>
        Email: ${escapeHtml(order.customer_email)}<br/>
        ${
          order.customer_phone
            ? `Phone: ${escapeHtml(order.customer_phone)}<br/>`
            : ""
        }
        Payment: ${escapeHtml(payment)}
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${orderItemsRows(order)}
      </table>
      <div style="margin-top:20px;">
        ${totalsBlock(order)}
      </div>
      <p style="margin:20px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#888;">
        Ship to
      </p>
      <p style="margin:0;font-size:14px;line-height:1.5;">${shippingBlock(order)}</p>
      <p style="margin:24px 0 0;">
        <a href="${escapeHtml(adminUrl)}"
           style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 20px;font-size:13px;">
          Open admin orders
        </a>
      </p>
    `
  );

  return {
    subject: `New order · ${order.order_number} · ${formatPrice(Number(order.total_amount))}`,
    html,
  };
}
