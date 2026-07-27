"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { easeOutExpo, useMotionProfile } from "@/lib/motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Stagger index when used as a child of StaggerReveal */
  index?: number;
  direction?: Direction;
  /** Blur is off by default on mobile for GPU performance */
  blur?: boolean;
  duration?: number;
}

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Scroll reveal (21st.dev Scroll Reveal pattern) —
 * mobile-first fade + slide; blur only when explicitly enabled.
 */
export function Reveal({
  children,
  delay = 0,
  y,
  className,
  index,
  direction = "up",
  blur,
  duration,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const profile = useMotionProfile();
  const distance = y ?? profile.y;
  const offset = offsetFor(direction, distance);
  const staggerDelay = typeof index === "number" ? index * profile.stagger : 0;
  const useBlur = blur === true;
  const animDuration = duration ?? profile.duration;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
      ...(useBlur ? { filter: "blur(6px)" } : {}),
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      ...(useBlur ? { filter: "blur(0px)" } : {}),
      transition: {
        duration: animDuration,
        delay: delay + staggerDelay,
        ease: easeOutExpo,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: profile.viewportAmount,
        margin: profile.viewportMargin,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
