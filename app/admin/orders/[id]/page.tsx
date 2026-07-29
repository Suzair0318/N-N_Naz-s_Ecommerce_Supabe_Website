import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft, Package } from "lucide-react";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAdminOrderById } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order details" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  const shippingFee =
    typeof order.shipping_address.shipping_fee === "number"
      ? order.shipping_address.shipping_fee
      : null;
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-charcoal"
      >
        <ChevronLeft className="h-3 w-3" /> Back to orders
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Order details</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">
            {order.order_number}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed{" "}
            {new Date(order.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <OrderStatusSelect
            orderId={order.id}
            currentStatus={order.order_status}
          />
          <Badge variant="muted">{order.payment_method}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="border border-border bg-white p-6">
          <h2 className="eyebrow mb-4">Items</h2>
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items.</p>
          ) : (
            <div className="space-y-4">
              {order.items.map((item) => {
                const thumb = [...(item.product?.images ?? [])].sort(
                  (a, b) => a.display_order - b.display_order
                )[0]?.image_url;
                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-muted">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={item.product?.title ?? "Product"}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {item.product?.title ?? "Item"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant ? `Size ${item.variant.size} · ` : ""}
                          Qty {item.quantity} ·{" "}
                          {formatPrice(Number(item.unit_price))} each
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm">
                      {formatPrice(Number(item.unit_price) * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <Separator className="my-6" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(itemsSubtotal)}</span>
            </div>
            {shippingFee != null && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Shipping
                  {order.shipping_address.city
                    ? ` (${order.shipping_address.city}`
                    : ""}
                  {typeof order.shipping_address.billable_kg === "number"
                    ? ` · ${order.shipping_address.billable_kg} kg`
                    : ""}
                  {order.shipping_address.city ? ")" : ""}
                </span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-border pt-2 font-serif text-xl">
              <span>Total</span>
              <span>{formatPrice(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-border bg-white p-6">
            <h2 className="eyebrow mb-3">Customer</h2>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customer_email}
            </p>
            {order.customer_phone && (
              <p className="mt-1 text-sm text-muted-foreground">
                {order.customer_phone}
              </p>
            )}
          </div>

          <div className="border border-border bg-white p-6">
            <h2 className="eyebrow mb-3">Shipping address</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {order.shipping_address.address}
              <br />
              {order.shipping_address.city}, {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
            </p>
          </div>

          <div className="border border-border bg-white p-6">
            <h2 className="eyebrow mb-3">Payment</h2>
            <p className="text-sm">
              {order.payment_method === "COD"
                ? "Cash on Delivery"
                : order.payment_method}
            </p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              Status: {order.payment_status}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              ID {order.id.slice(0, 8)}…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
