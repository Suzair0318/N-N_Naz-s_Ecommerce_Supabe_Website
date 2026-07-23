"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/admin/orders";
import type { OrderStatus } from "@/lib/supabase/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const next = value as OrderStatus;
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (!result.success) {
        setStatus(previous);
        toast.error(result.error ?? "Update failed");
      } else {
        toast.success(`Order marked as ${next}`);
      }
    });
  };

  return (
    <Select value={status} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="h-9 w-36 capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
