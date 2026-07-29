"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/motion/blur-fade";
import { Price } from "@/components/product/price";
import { ProductReviews } from "@/components/product/product-reviews";
import { SizeSelector } from "@/components/product/size-selector";
import { resolveUnitPrice } from "@/lib/pricing";
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

  const displayPrice = resolveUnitPrice(
    selectedVariant?.price_override,
    product.discount_price,
    product.base_price
  );
  const maxStock = selectedVariant?.stock_quantity ?? 0;
  const sizeSelected = Boolean(selectedVariant);
  const canAdjustQty = sizeSelected && maxStock > 0;
  const canIncreaseQty = canAdjustQty && quantity < maxStock;

  // Keep quantity within the selected size’s stock (and reset when size changes).
  useEffect(() => {
    if (!selectedVariant) {
      setQuantity(1);
      return;
    }
    const stock = selectedVariant.stock_quantity;
    if (stock <= 0) {
      setQuantity(1);
      return;
    }
    setQuantity((q) => Math.min(Math.max(1, q), stock));
  }, [selectedVariant]);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
  };

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

      <div className="grid w-full min-w-0 gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,28rem)_1fr]">
        {/* Gallery */}
        <motion.div
          className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-4 lg:mx-0 lg:max-w-none"
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted lg:max-h-[min(72vh,560px)] lg:aspect-auto lg:h-[min(72vh,560px)]">
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
                    sizes="(max-width: 1024px) 100vw, 448px"
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
              onSelect={handleSelectSize}
            />
          </div>

          {/* Quantity + Add to bag */}
          <div className="mt-8 flex w-full min-w-0 flex-wrap items-stretch gap-3">
            <div
              className={cn(
                "flex h-14 shrink-0 items-center border border-charcoal/20",
                !canAdjustQty && "opacity-50"
              )}
            >
              <button
                type="button"
                className="flex h-full w-11 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                disabled={!canAdjustQty || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium tracking-wide">
                {quantity}
              </span>
              <button
                type="button"
                className="flex h-full w-11 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                disabled={!canIncreaseQty}
                onClick={() => {
                  if (!sizeSelected) {
                    toast.error("Please select a size first");
                    return;
                  }
                  setQuantity((q) => Math.min(q + 1, maxStock));
                }}
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
                  price: displayPrice,
                })
              }
            >
              <Heart
                className={cn("h-5 w-5", inWishlist && "fill-gold text-gold")}
              />
            </Button>
          </div>

          {!sizeSelected && (
            <p className="mt-3 text-xs text-muted-foreground">
              Select a size to choose quantity.
            </p>
          )}
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
