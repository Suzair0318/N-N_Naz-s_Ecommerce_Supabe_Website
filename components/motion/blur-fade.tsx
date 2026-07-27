"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { easeOutExpo, useMotionProfile } from "@/lib/motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
  /** Soft blur — keep false on heavy mobile pages */
  blur?: boolean;
}

/**
 * Entrance fade inspired by 21st.dev / Magic UI.
 * Mobile: short slide + opacity only (no blur by default).
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  duration,
  yOffset,
  inView = true,
  blur = false,
}: BlurFadeProps) {
  const reduceMotion = useReducedMotion();
  const profile = useMotionProfile();
  const y = yOffset ?? profile.y;
  const d = duration ?? profile.duration;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y,
      ...(blur ? { filter: "blur(6px)" } : {}),
    },
    visible: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: "blur(0px)" } : {}),
      transition: {
        delay,
        duration: d,
        ease: easeOutExpo,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(inView
        ? {
            whileInView: "visible",
            viewport: {
              once: true,
              amount: profile.viewportAmount,
              margin: profile.viewportMargin,
            },
          }
        : { animate: "visible" })}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
