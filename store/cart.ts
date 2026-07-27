"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  size: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  /** Product unit weight in grams (from catalog). */
  weightGrams: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  syncPricing: (
    pricing: {
      variantId: string;
      unitPrice: number;
      maxStock?: number;
      weightGrams?: number;
    }[]
  ) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

function normalizeWeight(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * One cart line per product. Same product (any size) merges into a
 * single row; quantity increases and the latest size/variant wins.
 */
function dedupeByProduct(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();

  for (const raw of items) {
    if (!raw?.productId) continue;
    const item: CartItem = {
      ...raw,
      weightGrams: normalizeWeight(raw.weightGrams),
      quantity: Math.max(1, Number(raw.quantity) || 1),
      maxStock: Math.max(0, Number(raw.maxStock) || 0),
    };

    const existing = map.get(item.productId);
    if (!existing) {
      map.set(item.productId, {
        ...item,
        quantity: Math.min(item.quantity, item.maxStock || item.quantity),
      });
      continue;
    }

    const maxStock = item.maxStock || existing.maxStock;
    const nextQty = Math.min(
      existing.quantity + item.quantity,
      maxStock || existing.quantity + item.quantity
    );

    map.set(item.productId, {
      ...existing,
      ...item,
      quantity: Math.max(1, nextQty),
      maxStock,
      weightGrams: normalizeWeight(item.weightGrams),
    });
  }

  return Array.from(map.values());
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const weightGrams = normalizeWeight(item.weightGrams);
          const addQty = Math.max(1, quantity);
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );

          if (existing) {
            const maxStock = item.maxStock || existing.maxStock;
            const nextQty = Math.min(
              existing.quantity + addQty,
              maxStock || existing.quantity + addQty
            );
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      variantId: item.variantId,
                      size: item.size,
                      unitPrice: item.unitPrice,
                      maxStock,
                      weightGrams,
                      image: item.image ?? i.image,
                      slug: item.slug || i.slug,
                      title: item.title || i.title,
                      quantity: nextQty,
                    }
                  : i
              ),
            };
          }

          return {
            isOpen: true,
            items: [
              ...state.items,
              {
                ...item,
                weightGrams,
                quantity: Math.min(addQty, item.maxStock || addQty),
              },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: Math.max(1, Math.min(quantity, i.maxStock || quantity)),
                  }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      syncPricing: (pricing) =>
        set((state) => {
          if (!pricing.length || !state.items.length) return state;
          const byVariant = new Map(pricing.map((p) => [p.variantId, p]));
          let changed = false;
          const items = state.items.map((item) => {
            const live = byVariant.get(item.variantId);
            if (!live) return item;
            const unitPrice = Number(live.unitPrice);
            const next = {
              ...item,
              unitPrice:
                Number.isFinite(unitPrice) && unitPrice > 0
                  ? unitPrice
                  : item.unitPrice,
              maxStock:
                live.maxStock != null
                  ? Math.max(0, live.maxStock)
                  : item.maxStock,
              weightGrams:
                live.weightGrams != null
                  ? normalizeWeight(live.weightGrams)
                  : item.weightGrams,
            };
            if (
              next.unitPrice !== item.unitPrice ||
              next.maxStock !== item.maxStock ||
              next.weightGrams !== item.weightGrams
            ) {
              changed = true;
            }
            return next;
          });
          return changed ? { items } : state;
        }),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "naz-cart",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CartState>;
        return {
          ...current,
          ...p,
          items: Array.isArray(p.items)
            ? dedupeByProduct(p.items as CartItem[])
            : current.items,
        };
      },
    }
  )
);

export const selectSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

export const selectItemCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

/** Total cart weight in grams (unit weight × qty). */
export const selectCartWeightGrams = (items: CartItem[]) =>
  items.reduce(
    (sum, i) => sum + normalizeWeight(i.weightGrams) * i.quantity,
    0
  );
