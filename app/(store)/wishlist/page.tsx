"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Heart, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="container py-12">
      <div className="mb-10">
        <span className="eyebrow">Saved Pieces</span>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Wishlist</h1>
      </div>

      {!mounted || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-border py-20 text-center">
          <Heart className="h-10 w-10 text-silver" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild>
            <Link href="/shop">Discover the collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.productId} className="group relative">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Link href={`/product/${item.slug}`}>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </Link>
                <button
                  onClick={() => remove(item.productId)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-medium hover:text-gold"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-charcoal">{formatPrice(item.price)}</p>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href={`/product/${item.slug}`}>
                    <ShoppingBag className="h-3.5 w-3.5" /> View product
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
