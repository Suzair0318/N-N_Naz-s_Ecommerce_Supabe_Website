import Link from "next/link";

import {
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  getDashboardMetrics,
  getRecentOrders,
} from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [metrics, recentOrders] = await Promise.all([
    getDashboardMetrics(),
    getRecentOrders(8),
  ]);

  const cards = [
    {
      label: "Total Sales",
      value: formatPrice(metrics.totalSales),
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: metrics.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      label: "Low Stock Alerts",
      value: metrics.lowStockCount.toString(),
      icon: AlertTriangle,
      highlight: metrics.lowStockCount > 0,
    },
    {
      label: "Customers",
      value: metrics.customerCount.toString(),
      icon: Users,
    },
  ];

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="border border-border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </span>
                <Icon
                  className={cardIcon(card.highlight)}
                />
              </div>
              <p className="font-serif text-3xl">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="font-serif text-xl">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-widest link-gold underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{order.order_number}</td>
                    <td className="p-4 text-muted-foreground">
                      {order.customer_name}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{order.order_status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      {formatPrice(order.total_amount)}
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

function cardIcon(highlight?: boolean) {
  return highlight ? "h-5 w-5 text-destructive" : "h-5 w-5 text-gold";
}
