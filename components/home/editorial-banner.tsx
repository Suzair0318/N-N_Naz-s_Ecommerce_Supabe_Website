"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

export function EditorialBanner() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="container py-20">
      <div className="grid w-full min-w-0 overflow-hidden lg:grid-cols-2">
        <motion.div
          className="relative w-full min-w-0"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: -40, filter: "blur(8px)" }
          }
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease }}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-square lg:aspect-auto lg:min-h-full lg:h-full">
            <div className="relative h-full min-h-[320px] w-full overflow-hidden lg:min-h-[480px]">
              <motion.div
                className="absolute inset-0"
                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                transition={{ duration: 0.8, ease }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
                  alt="Shop the look editorial"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex w-full min-w-0 items-center bg-charcoal p-8 text-white sm:p-10 lg:p-16"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: 40, filter: "blur(8px)" }
          }
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          <div className="max-w-md">
            <motion.span
              className="eyebrow text-gold"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              The Look
            </motion.span>
            <motion.h2
              className="mt-3 font-serif text-3xl leading-tight sm:text-4xl"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.28, ease }}
            >
              Effortless silhouettes for the modern muse
            </motion.h2>
            <motion.p
              className="mt-5 text-sm text-white/70 sm:text-base"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.36, ease }}
            >
              Discover our styling edit — curated pieces designed to move
              seamlessly from day to evening. Timeless tailoring meets fluid
              femininity.
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.44, ease }}
            >
              <Button asChild variant="gold" size="lg" className="mt-8">
                <Link href="/shop">Shop the Look</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
