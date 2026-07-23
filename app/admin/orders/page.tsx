import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge } from "@/components/ui/badge";
import { getAllOrders } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage fulfillment and update order status.
        </p>
      </div>

      <div className="border border-border bg-white">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border align-middle last:border-0"
                  >
                    <td className="p-4 font-medium">{order.order_number}</td>
                    <td className="p-4">
                      <div className="text-charcoal">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="muted">{order.payment_method}</Badge>
                      <div className="mt-1 text-xs capitalize text-muted-foreground">
                        {order.payment_status}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="p-4">
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.order_status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
