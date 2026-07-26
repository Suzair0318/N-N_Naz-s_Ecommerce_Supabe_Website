"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatWeightKg,
  getBillableKg,
  getShippingFee,
  SHIPPING_KARACHI,
  SHIPPING_OTHER,
} from "@/constants/shop";
import { cn, formatPrice } from "@/lib/utils";
import { selectCartWeightGrams, selectSubtotal, useCart } from "@/store/cart";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const subtotal = selectSubtotal(items);
  const weightGrams = selectCartWeightGrams(items);
  const billableKg = getBillableKg(weightGrams);
  const estimateKarachi = getShippingFee("Karachi", weightGrams);
  const estimateOther = getShippingFee("Lahore", weightGrams);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Bag {mounted && items.length > 0 && `(${items.length})`}
          </SheetTitle>
        </SheetHeader>

        {!mounted || items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="h-10 w-10 text-silver" />
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button asChild variant="outline" onClick={() => setOpen(false)}>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Est. shipping for {formatWeightKg(weightGrams)} ({billableKg}{" "}
                kg):{" "}
                <span className="font-medium text-charcoal">
                  {formatPrice(estimateKarachi)}
                </span>{" "}
                Karachi ·{" "}
                <span className="font-medium text-charcoal">
                  {formatPrice(estimateOther)}
                </span>{" "}
                other cities
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Base 1 kg: {formatPrice(SHIPPING_KARACHI)} /{" "}
                {formatPrice(SHIPPING_OTHER)}. Extra kg = half base.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 border-b border-border py-5"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-muted">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium hover:text-gold"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remove item"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button
                          className="flex h-8 w-8 items-center justify-center hover:bg-muted"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          className={cn(
                            "flex h-8 w-8 items-center justify-center hover:bg-muted",
                            item.quantity >= item.maxStock &&
                              "cursor-not-allowed opacity-40"
                          )}
                          disabled={item.quantity >= item.maxStock}
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm uppercase tracking-wide text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-lg">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}>
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <button
                onClick={() => setOpen(false)}
                className="mt-3 w-full text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-charcoal"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
