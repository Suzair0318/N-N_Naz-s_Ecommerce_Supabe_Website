"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Stagger index when used as a child of StaggerReveal */
  index?: number;
  direction?: Direction;
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
 * Scroll reveal inspired by 21st.dev Reveal —
 * fades, un-blurs, and slides content into view.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  index,
  direction = "up",
  blur = true,
  duration = 0.7,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = offsetFor(direction, y);
  const staggerDelay = typeof index === "number" ? index * 0.08 : 0;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
      filter: blur ? "blur(8px)" : "blur(0px)",
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        delay: delay + staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
