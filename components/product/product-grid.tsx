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

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4",
          className
        )}
      >
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1, margin: "-40px" }}
    >
      {products.map((product, i) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} priority={i < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}
