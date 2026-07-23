"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
}

/**
 * Blur-fade entrance inspired by 21st.dev / Magic UI Blur Fade.
 * Soft blur → crisp focus with a light upward drift.
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.55,
  yOffset = 12,
  inView = true,
}: BlurFadeProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y: yOffset, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1],
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
            viewport: { once: true, amount: 0.2, margin: "-40px" },
          }
        : { animate: "visible" })}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
