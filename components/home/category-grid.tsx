"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { easeOutExpo, useMotionProfile } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { StorefrontCategory } from "@/lib/types";

interface CategoryGridProps {
  categories: Pick<
    StorefrontCategory,
    "id" | "name" | "slug" | "image_url" | "productCount"
  >[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const reduceMotion = useReducedMotion();
  const profile = useMotionProfile();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: profile.stagger,
        delayChildren: 0.04,
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

  const list = (
    <>
      {categories.map((c) => {
        const available = c.productCount > 0;
        const card = (
          <motion.div
            whileTap={
              reduceMotion || !available ? undefined : { scale: 0.98 }
            }
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <Link
              href={`/shop?category=${c.slug}`}
              aria-disabled={!available}
              className={cn(
                "group relative block aspect-[3/4] overflow-hidden bg-muted",
                !available && "pointer-events-auto"
              )}
            >
              {c.image_url ? (
                <Image
                  src={c.image_url}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={cn(
                    "object-cover transition-transform duration-500 ease-out sm:duration-700",
                    available
                      ? "group-active:scale-105 sm:group-hover:scale-105"
                      : "scale-100 grayscale-[35%]"
                  )}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/80 to-gold/30" />
              )}
              <div
                className={cn(
                  "absolute inset-0 transition-colors duration-400",
                  available
                    ? "bg-charcoal/25 group-active:bg-charcoal/40 sm:group-hover:bg-charcoal/40"
                    : "bg-charcoal/55"
                )}
              />

              {!available && (
                <div className="absolute left-3 top-3 z-10">
                  <Badge variant="muted">Not available</Badge>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-serif text-lg text-white sm:text-xl">
                  {c.name}
                </h3>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-widest sm:text-xs",
                    available ? "text-gold" : "text-white/60"
                  )}
                >
                  {available ? "Shop now" : "Coming soon"}
                </span>
              </div>
            </Link>
          </motion.div>
        );

        if (reduceMotion) {
          return <div key={c.id}>{card}</div>;
        }

        return (
          <motion.div key={c.id} variants={item}>
            {card}
          </motion.div>
        );
      })}
    </>
  );

  if (reduceMotion) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {list}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: profile.viewportAmount,
        margin: profile.viewportMargin,
      }}
    >
      {list}
    </motion.div>
  );
}
