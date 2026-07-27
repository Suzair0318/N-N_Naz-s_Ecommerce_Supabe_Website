"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { easeOutExpo, useMotionProfile } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  fromY?: number;
  duration?: number;
}

/**
 * Staggered list/grid reveal (21st pattern) — snappy on mobile.
 */
export function StaggerReveal({
  children,
  className,
  stagger,
  fromY,
  duration,
}: StaggerRevealProps) {
  const reduceMotion = useReducedMotion();
  const profile = useMotionProfile();
  const staggerChildren = stagger ?? profile.stagger;
  const y = fromY ?? profile.y;
  const d = duration ?? profile.duration;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        delayChildren: 0.04,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y,
      scale: profile.scaleFrom,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: d,
        ease: easeOutExpo,
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: profile.viewportAmount,
        margin: profile.viewportMargin,
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const profile = useMotionProfile();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: profile.y,
          scale: profile.scaleFrom,
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: profile.duration,
            ease: easeOutExpo,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
