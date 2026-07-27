"use client";

import { useEffect, useState } from "react";

/** Shared easing — 21st / Magic UI style soft ease-out. */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

/**
 * Mobile-first motion tokens.
 * Prefer transform + opacity only (blur is costly on phones).
 */
export const motionTokens = {
  mobile: {
    y: 18,
    duration: 0.45,
    stagger: 0.05,
    scaleFrom: 0.98,
    viewportAmount: 0.12,
    viewportMargin: "-24px",
  },
  desktop: {
    y: 28,
    duration: 0.65,
    stagger: 0.08,
    scaleFrom: 0.96,
    viewportAmount: 0.2,
    viewportMargin: "-40px",
  },
} as const;

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);

  return isMobile;
}

/** Pick mobile or desktop motion values; defaults to mobile (most traffic). */
export function useMotionProfile() {
  const isMobile = useIsMobile();
  return isMobile ? motionTokens.mobile : motionTokens.desktop;
}
