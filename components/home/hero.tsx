"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-charcoal">
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease }}
      >
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
          alt="Naz's Collection editorial hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />

      <div className="container relative flex h-full flex-col items-center justify-center text-center text-white">
        <motion.p
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 16, filter: "blur(8px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, ease }}
          className="mb-4 text-xs uppercase tracking-[0.4em] text-gold"
        >
          Curated Brands · Women&apos;s Fashion
        </motion.p>
        <motion.h1
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 28, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.12, ease }}
          className="max-w-3xl font-serif text-5xl leading-tight tracking-tight sm:text-6xl md:text-7xl"
        >
          Your Favorite Brands,
          <br /> One Destination
        </motion.h1>
        <motion.p
          initial={
            reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.95, delay: 0.28, ease }}
          className="mt-6 max-w-xl text-base text-white/80"
        >
          Discover premium women&apos;s clothing from the brands you love —
          handpicked styles for every mood, moment, and silhouette.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.42, ease }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/shop">Shop Brands</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="border border-white bg-transparent text-white hover:bg-white hover:text-charcoal"
          >
            <Link href="/shop?sort=newest">New Arrivals</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
