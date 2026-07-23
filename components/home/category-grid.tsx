"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Pick<Category, "id" | "name" | "slug" | "image_url">[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.97,
      filter: "blur(8px)",
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const list = (
    <>
      {categories.map((c) => {
        const card = (
          <Link
            href={`/shop?category=${c.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden bg-muted"
          >
            {c.image_url && (
              <Image
                src={c.image_url}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-charcoal/20 transition-colors duration-500 group-hover:bg-charcoal/40" />
            <div className="absolute inset-x-0 bottom-0 translate-y-1 p-5 transition-transform duration-500 group-hover:translate-y-0">
              <h3 className="font-serif text-xl text-white">{c.name}</h3>
              <span className="text-xs uppercase tracking-widest text-gold opacity-80 transition-opacity group-hover:opacity-100">
                Shop now
              </span>
            </div>
          </Link>
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
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{list}</div>;
  }

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "-60px" }}
    >
      {list}
    </motion.div>
  );
}
