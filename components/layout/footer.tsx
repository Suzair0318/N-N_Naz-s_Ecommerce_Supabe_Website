"use client";

import Link from "next/link";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { NewsletterForm } from "@/components/layout/newsletter-form";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Dresses", href: "/shop?category=dresses" },
  { label: "Outerwear", href: "/shop?category=outerwear" },
];

const helpLinks = [
  { label: "Shipping & Returns", href: "/shop" },
  { label: "Size Guide", href: "/shop" },
  { label: "Contact", href: "/shop" },
  { label: "Track Order", href: "/account" },
];

export function Footer() {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const columns = (
    <>
      <FooterCol variants={reduceMotion ? undefined : item}>
        <p className="font-serif text-2xl tracking-[0.2em] text-gold">
          NAZ&apos;S
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          Modern elegance for the contemporary woman. Thoughtfully designed,
          ethically made.
        </p>
      </FooterCol>

      <FooterCol variants={reduceMotion ? undefined : item}>
        <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-white/80">
          Shop
        </h4>
        <ul className="space-y-3">
          {shopLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm text-white/60 transition-colors hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </FooterCol>

      <FooterCol variants={reduceMotion ? undefined : item}>
        <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-white/80">
          Client Care
        </h4>
        <ul className="space-y-3">
          {helpLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm text-white/60 transition-colors hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </FooterCol>

      <FooterCol variants={reduceMotion ? undefined : item} className="space-y-4">
        <h4 className="text-xs uppercase tracking-[0.25em] text-white/80">
          Newsletter
        </h4>
        <p className="text-sm text-white/60">
          Subscribe for private previews and early access.
        </p>
        <NewsletterForm />
      </FooterCol>
    </>
  );

  return (
    <footer className="bg-charcoal text-white">
      {reduceMotion ? (
        <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {columns}
        </div>
      ) : (
        <motion.div
          className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {columns}
        </motion.div>
      )}

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Naz&apos;s Collection. All rights
            reserved.
          </p>
          <p className="uppercase tracking-widest">Modern Elegance · 2026</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  children,
  className = "space-y-4",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  if (!variants) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
