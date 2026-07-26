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
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

function normalizeWeight(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const weightGrams = normalizeWeight(item.weightGrams);
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );
          if (existing) {
            const nextQty = Math.min(
              existing.quantity + quantity,
              item.maxStock
            );
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: nextQty, weightGrams }
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
                quantity: Math.min(quantity, item.maxStock),
              },
            ],
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.variantId === variantId
                ? {
                    ...i,
                    quantity: Math.max(1, Math.min(quantity, i.maxStock)),
                  }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
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
            ? p.items.map((item) => ({
                ...item,
                weightGrams: normalizeWeight(
                  (item as CartItem).weightGrams
                ),
              }))
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
