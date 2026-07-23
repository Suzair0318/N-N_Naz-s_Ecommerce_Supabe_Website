"use client";

import { useEffect } from "react";

import confetti from "canvas-confetti";

/**
 * Fires a party-boom confetti celebration once when the order
 * confirmation page mounts.
 */
export function OrderCelebration() {
  useEffect(() => {
    const duration = 2800;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ["#D4AF37", "#121212", "#C0C0C0", "#FFFFFF"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ["#D4AF37", "#121212", "#C0C0C0", "#FFFFFF"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Big initial boom
    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 45,
      origin: { y: 0.55 },
      colors: ["#D4AF37", "#121212", "#C0C0C0", "#E4C766", "#FFFFFF"],
    });

    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
