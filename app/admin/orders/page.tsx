import { Suspense } from "react";

import { OrdersSearch } from "@/components/admin/orders-search";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAllOrders } from "@/lib/repositories/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const orders = await getAllOrders(q);

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage fulfillment, update status, or delete orders.
        </p>
      </div>

      <Suspense fallback={null}>
        <OrdersSearch initialQuery={q} />
      </Suspense>

      <div className="border border-border bg-white">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {q
              ? `No orders match “${q}”. Try another order #, email, or name.`
              : "No orders yet."}
          </p>
        ) : (
          <>
            {q && (
              <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground">
                Showing {orders.length} result{orders.length === 1 ? "" : "s"}{" "}
                for “{q}”
              </p>
            )}
            <OrdersTable orders={orders} />
          </>
        )}
      </div>
    </div>
  );
}
