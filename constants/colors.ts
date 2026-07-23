/**
 * Central luxury brand palette for "Naz's Collection".
 * Use these tokens in JS/TS contexts (charts, inline styles, canvas, etc.).
 * Tailwind classes mirror these values in tailwind.config.ts.
 */
export const COLORS = {
  white: "#FFFFFF",
  offWhite: "#FAFAFA",
  charcoal: "#121212",
  gold: "#D4AF37",
  goldLight: "#E4C766",
  goldDark: "#B8942B",
  silver: "#C0C0C0",
  paleSilver: "#E0E0E0",
} as const;

export type BrandColor = keyof typeof COLORS;
