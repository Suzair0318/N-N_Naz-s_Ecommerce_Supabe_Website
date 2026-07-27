"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/product/price";
import { resolveUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) =>
    s.items.some((i) => i.productId === product.id)
  );

  const images = [...product.images].sort(
    (a, b) => a.display_order - b.display_order
  );
  const primary = images[0]?.image_url ?? null;
  const secondary = images[1]?.image_url ?? primary;

  const firstAvailable = product.variants.find((v) => v.stock_quantity > 0);
  const soldOut = !firstAvailable;

  const handleQuickAdd = () => {
    if (!firstAvailable) return;
    addItem({
      variantId: firstAvailable.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: primary,
      size: firstAvailable.size,
      unitPrice: resolveUnitPrice(
        firstAvailable.price_override,
        product.discount_price,
        product.base_price
      ),
      maxStock: firstAvailable.stock_quantity,
      weightGrams: product.weight != null ? Number(product.weight) : 0,
    });
    toast.success("Added to bag", {
      description: `${product.title} — Size ${firstAvailable.size}`,
    });
  };

  return (
    <motion.div
      className="group relative flex flex-col"
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden bg-muted"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          {primary ? (
            <motion.div
              className="absolute inset-0"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: hovered ? 1.05 : 1 }
              }
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={primary}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={priority}
                className={cn(
                  "object-cover transition-opacity duration-700",
                  hovered && secondary !== primary ? "opacity-0" : "opacity-100"
                )}
              />
              {secondary && secondary !== primary && (
                <Image
                  src={secondary}
                  alt={`${product.title} alternate view`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    hovered ? "opacity-100" : "opacity-0"
                  )}
                />
              )}
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.discount_price && (
            <Badge variant="gold">Sale</Badge>
          )}
          {soldOut && <Badge variant="muted">Sold out</Badge>}
        </div>

        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: primary,
              price: effectivePrice,
            })
          }
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-white"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              inWishlist ? "fill-gold text-gold" : "text-charcoal"
            )}
          />
        </button>

        {!soldOut && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 bg-charcoal py-3 text-xs font-medium uppercase tracking-widest text-white opacity-0 transition-all duration-300 hover:bg-gold hover:text-charcoal group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingBag className="h-4 w-4" /> Quick add
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {product.brand_name && (
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {product.brand_name}
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-sans text-sm font-medium tracking-wide text-charcoal transition-colors group-hover:text-gold">
            {product.title}
          </h3>
        </Link>
        <Price
          basePrice={product.base_price}
          discountPrice={product.discount_price}
          size="sm"
        />
      </div>
    </motion.div>
  );
}
