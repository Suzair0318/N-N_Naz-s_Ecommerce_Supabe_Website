"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteOrders } from "@/lib/actions/admin/orders";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const allSelected =
    orders.length > 0 && orders.every((o) => selected.has(o.id));
  const someSelected = selected.size > 0 && !allSelected;

  const pendingLabels = useMemo(() => {
    if (!pendingDeleteIds?.length) return [];
    const byId = new Map(orders.map((o) => [o.id, o.order_number]));
    return pendingDeleteIds.map((id) => byId.get(id) ?? id);
  }, [orders, pendingDeleteIds]);

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(orders.map((o) => o.id)));
  };

  const confirmDelete = () => {
    if (!pendingDeleteIds?.length) return;
    const ids = pendingDeleteIds;
    startTransition(async () => {
      const result = await deleteOrders(ids);
      if (!result.success) {
        toast.error(result.error ?? "Delete failed");
        return;
      }
      toast.success(
        result.deleted === 1
          ? "Order deleted"
          : `${result.deleted} orders deleted`
      );
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setPendingDeleteIds(null);
      router.refresh();
    });
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-offwhite px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {selected.size} selected
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setPendingDeleteIds([...selected])}
          >
            <Trash2 className="h-4 w-4" />
            Delete selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-12 p-4">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(v) => toggleAll(v === true)}
                  aria-label="Select all orders"
                />
              </th>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border align-middle last:border-0"
              >
                <td className="p-4">
                  <Checkbox
                    checked={selected.has(order.id)}
                    onCheckedChange={(v) => toggleOne(order.id, v === true)}
                    aria-label={`Select ${order.order_number}`}
                  />
                </td>
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
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${order.order_number}`}
                    >
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${order.order_number}`}
                      onClick={() => setPendingDeleteIds([order.id])}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={pendingDeleteIds !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setPendingDeleteIds(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingDeleteIds?.length === 1
                ? "Delete order"
                : `Delete ${pendingDeleteIds?.length ?? 0} orders`}
            </DialogTitle>
            <DialogDescription>
              {pendingDeleteIds?.length === 1 ? (
                <>
                  Delete order{" "}
                  <span className="font-medium text-foreground">
                    {pendingLabels[0]}
                  </span>
                  ? Line items will be removed too. This cannot be undone.
                </>
              ) : (
                <>
                  Delete{" "}
                  <span className="font-medium text-foreground">
                    {pendingDeleteIds?.length}
                  </span>{" "}
                  selected orders and their line items? This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setPendingDeleteIds(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
