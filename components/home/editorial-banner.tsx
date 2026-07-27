"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { easeOutExpo, useIsMobile, useMotionProfile } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";

type PromoCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  image: string;
  tone: "dark" | "light" | "gold";
};

const PROMO_CARDS: PromoCard[] = [
  {
    id: "sale",
    eyebrow: "Limited edit",
    title: "Season sale",
    description: "Selected pieces marked down — while sizes last.",
    href: "/shop?sort=price_asc",
    cta: "Shop sale",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    tone: "dark",
  },
  {
    id: "new",
    eyebrow: "Just landed",
    title: "New arrivals",
    description: "Fresh drops curated for Naz's Collection.",
    href: "/shop?sort=newest",
    cta: "See what's new",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
    tone: "light",
  },
  {
    id: "ship",
    eyebrow: "Pakistan-wide",
    title: "COD & delivery",
    description: "Cash on delivery with weight-based shipping.",
    href: "/shop",
    cta: "Start shopping",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    tone: "gold",
  },
];

/**
 * Premium offers section — promo banner + offer cards.
 * Inspired by 21st.dev Flash Sale Banner + Promo Card patterns.
 */
export function EditorialBanner({
  saleHint,
}: {
  /** Optional live sale cue, e.g. lowest discount product price */
  saleHint?: { label: string; price: number } | null;
}) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const profile = useMotionProfile();

  return (
    <section className="overflow-x-hidden py-14 sm:py-20">
      <div className="container">
        <motion.div
          className="mb-8 max-w-xl sm:mb-10"
          initial={reduceMotion ? false : { opacity: 0, y: profile.y }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: profile.duration, ease: easeOutExpo }}
        >
          <span className="eyebrow text-gold-dark">This week</span>
          <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
            Offers &amp; curated edits
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Limited-time drops, new arrivals, and easy checkout — made for
            browsing on the go.
          </p>
        </motion.div>

        <motion.div
          className="relative mb-4 overflow-hidden bg-charcoal text-white sm:mb-5"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: easeOutExpo }}
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/55" />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-12">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                Weekend flash edit
              </div>
              <h3 className="max-w-lg font-serif text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Soft silhouettes.
                <br />
                Sharper prices.
              </h3>
              <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                {saleHint
                  ? `Looks from ${saleHint.label} starting ${formatPrice(saleHint.price)}.`
                  : "Handpicked sale pieces refreshed every week."}
              </p>

              <motion.div
                className="mt-8"
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                <Button
                  asChild
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/shop?sort=price_asc">Shop the flash edit</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMO_CARDS.map((card, index) => (
            <PromoOfferCard
              key={card.id}
              card={card}
              index={index}
              reduceMotion={!!reduceMotion}
              isMobile={isMobile}
            />
          ))}
        </div>

        <motion.p
          className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Truck className="h-3.5 w-3.5 text-gold-dark" />
          Karachi from {formatPrice(350)} · other cities from {formatPrice(450)}{" "}
          (1st kg)
        </motion.p>
      </div>
    </section>
  );
}

function PromoOfferCard({
  card,
  index,
  reduceMotion,
  isMobile,
}: {
  card: PromoCard;
  index: number;
  reduceMotion: boolean;
  isMobile: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: 0.06 * index,
        ease: easeOutExpo,
      }}
      whileHover={reduceMotion || isMobile ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      className="group relative min-h-[280px] overflow-hidden sm:min-h-[320px]"
    >
      <Link href={card.href} className="absolute inset-0 block">
        <Image
          src={card.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-active:scale-105"
        />
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-500",
            card.tone === "dark" && "bg-charcoal/55 group-hover:bg-charcoal/65",
            card.tone === "light" && "bg-charcoal/35 group-hover:bg-charcoal/50",
            card.tone === "gold" &&
              "bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-gold/20"
          )}
        />
      </Link>

      <div className="relative flex h-full min-h-[280px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-6">
        <span className="text-[10px] uppercase tracking-[0.22em] text-gold">
          {card.eyebrow}
        </span>
        <h3 className="mt-2 font-serif text-2xl tracking-tight text-white">
          {card.title}
        </h3>
        <p className="mt-2 max-w-[18rem] text-sm text-white/75">
          {card.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-white">
          {card.cta}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.div>
  );
}
