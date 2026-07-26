"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { ProductCard } from "@/components/product/product-card";
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
      transition: { staggerChildren: 0.07, delayChildren: 0.04 },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: 32,
      scale: 0.97,
      filter: "blur(6px)",
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const gridClass = cn(
    "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4",
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
      animate="show"
    >
      {products.map((product, i) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} priority={i < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}
