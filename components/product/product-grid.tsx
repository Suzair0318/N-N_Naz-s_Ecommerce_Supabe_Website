"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { ProductCard } from "@/components/product/product-card";
import { easeOutExpo, useMotionProfile } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/types";

interface ProductGridProps {
  products: ProductCardData[];
  className?: string;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  className,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  const reduceMotion = useReducedMotion();
  const profile = useMotionProfile();
  const listKey = products.map((p) => p.id).join("|");

  if (products.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: profile.stagger,
        delayChildren: 0.03,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: profile.y,
      scale: profile.scaleFrom,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: profile.duration, ease: easeOutExpo },
    },
  };

  const gridClass = cn(
    // Mobile: 2 equal columns. Desktop: fixed-width tracks so cards
    // stay compact even when only one product is shown.
    "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10",
    "lg:[grid-template-columns:repeat(auto-fill,minmax(200px,240px))] lg:justify-start lg:gap-x-5 lg:gap-y-12",
    className
  );

  if (reduceMotion) {
    return (
      <div className={gridClass}>
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={listKey}
      className={gridClass}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.08,
        margin: profile.viewportMargin,
      }}
    >
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          variants={item}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <ProductCard product={product} priority={i < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}
