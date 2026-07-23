import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/repositories/orders";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/account");

  const orders = await getOrdersForUser(profile.id);

  return (
    <div className="container py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">My Account</span>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">
            {profile.full_name || "Welcome"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {profile.role === "admin" && (
            <Button asChild variant="gold" size="sm">
              <Link href="/admin/dashboard">Admin Panel</Link>
            </Button>
          )}
          <SignOutButton />
        </div>
      </div>

      <h2 className="mb-6 font-serif text-2xl">Order History</h2>

      {orders.length === 0 ? (
        <div className="border border-border p-10 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-border p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium tracking-wide">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{order.order_status}</Badge>
                  <span className="font-serif text-lg">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>
                      {item.product?.title ?? "Item"}
                      {item.variant && ` — Size ${item.variant.size}`} ×{" "}
                      {item.quantity}
                    </span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
