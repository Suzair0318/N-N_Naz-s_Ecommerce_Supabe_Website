import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckCircle2, Package } from "lucide-react";

import { OrderCelebration } from "@/components/order/order-celebration";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOrderForConfirmation } from "@/lib/repositories/orders";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Order Details" };

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrderForConfirmation(params.orderId);
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
    <div className="container max-w-3xl overflow-x-hidden py-12 sm:py-16">
      <OrderCelebration />

      <div className="mb-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
        <p className="eyebrow mt-4 text-gold">Order placed successfully</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
          Your order details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirmation sent to {order.customer_email}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 border border-border px-4 py-2 text-sm">
          <Package className="h-4 w-4 text-gold" />
          Order{" "}
          <span className="font-medium tracking-wide">{order.order_number}</span>
        </p>
      </div>

      <div className="border border-border bg-white p-6 sm:p-8">
        <h2 className="eyebrow mb-4">Items ordered</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">
                  {item.product?.title ?? "Item"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.variant ? `Size ${item.variant.size} · ` : ""}
                  Qty {item.quantity}
                </p>
              </div>
              <span className="shrink-0 text-sm">
                {formatPrice(Number(item.unit_price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow mb-2">Shipping to</h3>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.shipping_address.address}
              <br />
              {order.shipping_address.city}, {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
            </p>
            {order.customer_phone && (
              <p className="mt-2 text-xs text-muted-foreground">
                Phone: {order.customer_phone}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <h3 className="eyebrow mb-2">Payment &amp; total</h3>
            <p className="text-sm">
              {order.payment_method === "COD"
                ? "Cash on Delivery"
                : "Card / Online"}
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between gap-4 sm:justify-end sm:gap-8">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(itemsSubtotal)}</span>
              </div>
              {shippingFee != null && (
                <div className="flex justify-between gap-4 sm:justify-end sm:gap-8">
                  <span className="text-muted-foreground">
                    Shipping ({order.shipping_address.city}
                    {typeof order.shipping_address.billable_kg === "number"
                      ? ` · ${order.shipping_address.billable_kg} kg`
                      : ""}
                    )
                  </span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-border pt-2 font-serif text-xl sm:justify-end sm:gap-8">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account">View order history</Link>
        </Button>
      </div>
    </div>
  );
}
