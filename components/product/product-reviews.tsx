"use client";

import { useMemo } from "react";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
}

/** Deterministic 0–1 value from a string (stable per product, varies by product). */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function seeded(productId: string, salt: string) {
  return hash01(`${productId}::${salt}`);
}

function buildRatingStats(productId: string) {
  const total = 12 + Math.floor(seeded(productId, "total") * 88); // 12–99

  // Independent weights per star so each product gets a unique shape
  const raw = [
    0.25 + seeded(productId, "w5") * 0.55, // 5★
    0.08 + seeded(productId, "w4") * 0.35, // 4★
    0.04 + seeded(productId, "w3") * 0.22, // 3★
    0.01 + seeded(productId, "w2") * 0.12, // 2★
    0.005 + seeded(productId, "w1") * 0.08, // 1★
  ];
  const sumRaw = raw.reduce((a, b) => a + b, 0);

  let remaining = total;
  const counts = raw.map((w, i) => {
    if (i === raw.length - 1) return Math.max(0, remaining);
    const count = Math.round((w / sumRaw) * total);
    remaining -= count;
    return Math.max(0, count);
  });

  // Fix rounding drift so counts always sum to total
  const drift = total - counts.reduce((a, b) => a + b, 0);
  counts[0] = Math.max(0, counts[0] + drift);

  const distribution = [5, 4, 3, 2, 1].map((stars, i) => ({
    stars,
    count: counts[i],
    percent: total ? Math.round((counts[i] / total) * 100) : 0,
  }));

  const average =
    Math.round(
      (distribution.reduce((acc, row) => acc + row.stars * row.count, 0) /
        Math.max(total, 1)) *
        10
    ) / 10;

  return { average, total, distribution };
}

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i < rating ? "fill-gold text-gold" : "fill-transparent text-border"
          )}
        />
      ))}
    </span>
  );
}

export function ProductReviews({ productId, productTitle }: ProductReviewsProps) {
  const { average, total, distribution } = useMemo(
    () => buildRatingStats(productId),
    [productId]
  );

  return (
    <section
      className="mt-16 border-t border-border pt-12"
      aria-labelledby="reviews-heading"
    >
      <div className="mb-8">
        <span className="eyebrow">Customer love</span>
        <h2
          id="reviews-heading"
          className="mt-2 font-serif text-3xl tracking-tight"
        >
          Reviews
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Rating overview for {productTitle}.
        </p>
      </div>

      <div className="max-w-md">
        <div className="flex items-end gap-3">
          <span className="font-serif text-5xl tracking-tight text-charcoal">
            {average.toFixed(1)}
          </span>
          <div className="mb-1.5">
            <Stars rating={Math.round(average)} size="md" />
            <p className="mt-1 text-xs text-muted-foreground">
              Based on {total} reviews
            </p>
          </div>
        </div>

        <ul className="mt-8 space-y-2.5" aria-label="Rating breakdown">
          {distribution.map((row) => (
            <li key={row.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 tabular-nums text-muted-foreground">
                {row.stars}★
              </span>
              <div
                className="h-1.5 flex-1 overflow-hidden bg-muted"
                role="progressbar"
                aria-valuenow={row.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${row.stars} star reviews`}
              >
                <div
                  className="h-full bg-gold transition-[width] duration-700 ease-out"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                {row.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
