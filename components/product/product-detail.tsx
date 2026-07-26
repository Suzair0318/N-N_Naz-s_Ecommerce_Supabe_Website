"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/motion/blur-fade";
import { Price } from "@/components/product/price";
import { ProductReviews } from "@/components/product/product-reviews";
import { SizeSelector } from "@/components/product/size-selector";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export function ProductDetail({ product }: { product: ProductWithRelations }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) =>
    s.items.some((i) => i.productId === product.id)
  );

  const images = product.images.length
    ? product.images
    : [{ id: "placeholder", image_url: "", display_order: 0, product_id: product.id }];

  const [activeImage, setActiveImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  const sizeOptions = useMemo(() => {
    const list = product.variants.map((v) => ({
      size: v.size,
      disabled: v.stock_quantity <= 0,
    }));
    return Array.from(new Map(list.map((s) => [s.size, s])).values());
  }, [product.variants]);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.size === selectedSize),
    [product.variants, selectedSize]
  );

  const effectivePrice = product.discount_price ?? product.base_price;
  const displayPrice = selectedVariant?.price_override ?? effectivePrice;
  const maxStock = selectedVariant?.stock_quantity ?? 0;

  const handleAddToBag = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedVariant || maxStock <= 0) {
      toast.error("This selection is out of stock");
      return;
    }
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: images[0].image_url || null,
        size: selectedVariant.size,
        unitPrice: displayPrice,
        maxStock,
        weightGrams: product.weight != null ? Number(product.weight) : 0,
      },
      quantity
    );
    toast.success("Added to bag", {
      description: `${product.title} — Size ${selectedVariant.size}`,
    });
  };

  return (
    <div className="container max-w-full overflow-x-hidden py-10">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push("/shop");
        }}
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid w-full min-w-0 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <motion.div
          className="flex w-full min-w-0 flex-col gap-4"
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              {images[activeImage].image_url ? (
                <motion.div
                  key={images[activeImage].id}
                  className="absolute inset-0"
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, scale: 1.02, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, scale: 0.99, filter: "blur(4px)" }
                  }
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={images[activeImage].image_url}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                  />
                </motion.div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="flex w-full gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-20 w-16 shrink-0 overflow-hidden border",
                    activeImage === i ? "border-charcoal" : "border-transparent"
                  )}
                >
                  {img.image_url && (
                    <Image
                      src={img.image_url}
                      alt={`${product.title} view ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <BlurFade className="min-w-0 w-full lg:py-4" delay={0.1} inView={false}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {product.brand_name && (
              <span className="eyebrow text-gold">{product.brand_name}</span>
            )}
            {product.category && (
              <span className="eyebrow">{product.category.name}</span>
            )}
          </div>
          <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <Price
            basePrice={product.base_price}
            discountPrice={product.discount_price}
            size="lg"
            className="mt-4"
          />

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.weight != null && (
            <p className="mt-3 text-xs text-muted-foreground">
              Weight: {Number(product.weight)} g
            </p>
          )}

          {/* Size */}
          <div className="mt-8">
            <span className="mb-3 block text-sm font-medium">Size</span>
            <SizeSelector
              options={sizeOptions}
              selected={selectedSize}
              onSelect={setSelectedSize}
            />
          </div>

          {/* Quantity + Add to bag */}
          <div className="mt-8 flex w-full min-w-0 flex-wrap items-stretch gap-3">
            <div className="flex h-14 shrink-0 items-center border border-charcoal/20">
              <button
                className="flex h-full w-11 items-center justify-center transition-colors hover:bg-muted"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium tracking-wide">
                {quantity}
              </span>
              <button
                className="flex h-full w-11 items-center justify-center transition-colors hover:bg-muted disabled:opacity-40"
                disabled={maxStock > 0 && quantity >= maxStock}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              size="lg"
              className="group relative min-w-0 flex-1 overflow-hidden border border-charcoal bg-charcoal text-xs font-medium uppercase tracking-[0.22em] text-white transition-all duration-500 hover:border-gold hover:bg-gold hover:text-charcoal disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
              onClick={handleAddToBag}
              disabled={selectedVariant ? maxStock <= 0 : false}
            >
              <ShoppingBag className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
              {selectedVariant && maxStock <= 0 ? "Out of stock" : "Add to Bag"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 shrink-0 border-charcoal/20 transition-colors duration-300 hover:border-gold hover:text-gold"
              aria-label="Add to wishlist"
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  slug: product.slug,
                  title: product.title,
                  image: images[0].image_url || null,
                  price: effectivePrice,
                })
              }
            >
              <Heart
                className={cn("h-5 w-5", inWishlist && "fill-gold text-gold")}
              />
            </Button>
          </div>

          {selectedVariant && maxStock > 0 && maxStock <= 3 && (
            <p className="mt-3 text-xs text-gold-dark">
              Only {maxStock} left — order soon
            </p>
          )}
        </BlurFade>
      </div>

      <ProductReviews productId={product.id} productTitle={product.title} />
    </div>
  );
}
