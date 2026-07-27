"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { easeOutExpo, useIsMobile } from "@/lib/motion";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
    alt: "Editorial fashion look",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80",
    alt: "Shopping style editorial",
  },
  {
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80",
    alt: "Runway inspired styling",
  },
  {
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=80",
    alt: "Modern muse portrait",
  },
] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [slide, setSlide] = useState(0);

  const textY = isMobile ? 14 : 24;
  const duration = isMobile ? 0.55 : 0.9;

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setSlide((i) => (i + 1) % HERO_SLIDES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section className="relative h-[78vh] min-h-[480px] w-full overflow-hidden bg-charcoal sm:h-[88vh] sm:min-h-[560px]">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={reduceMotion ? "static" : slide}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 1.1, ease: easeOutExpo }}
          >
            <Image
              src={HERO_SLIDES[reduceMotion ? 0 : slide].src}
              alt={HERO_SLIDES[reduceMotion ? 0 : slide].alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/45 to-charcoal/25" />
      <div className="absolute inset-0 bg-charcoal/20" />

      <div className="container relative z-10 flex h-full flex-col items-center justify-end pb-16 text-center text-white sm:justify-center sm:pb-0">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: textY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: easeOutExpo }}
          className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold sm:mb-4 sm:text-xs sm:tracking-[0.4em]"
        >
          Curated Brands · Women&apos;s Fashion
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: textY + 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: duration + 0.1,
            delay: 0.08,
            ease: easeOutExpo,
          }}
          className="max-w-3xl font-serif text-[2.35rem] leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
        >
          Your Favorite Brands,
          <br /> One Destination
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: textY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: 0.18, ease: easeOutExpo }}
          className="mt-4 max-w-md text-sm text-white/80 sm:mt-6 sm:max-w-xl sm:text-base"
        >
          Discover premium women&apos;s clothing from the brands you love —
          handpicked styles for every mood, moment, and silhouette.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: textY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: 0.28, ease: easeOutExpo }}
          className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
        >
          <motion.div
            className="w-full sm:w-auto"
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
              <Link href="/shop">Shop Brands</Link>
            </Button>
          </motion.div>
          <motion.div
            className="w-full sm:w-auto"
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              asChild
              size="lg"
              className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-charcoal sm:w-auto"
            >
              <Link href="/shop?sort=newest">New Arrivals</Link>
            </Button>
          </motion.div>
        </motion.div>

        {!reduceMotion && (
          <div className="mt-6 flex items-center gap-2 sm:mt-8">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === slide ? "w-6 bg-gold" : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
