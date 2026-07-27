import Link from "next/link";

import { CategoryGrid } from "@/components/home/category-grid";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { Hero } from "@/components/home/hero";
import { BlurFade } from "@/components/motion/blur-fade";
import { Reveal } from "@/components/motion/reveal";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { getCategoriesForStorefront } from "@/lib/repositories/categories";
import {
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/repositories/products";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured, newArrivals] = await Promise.all([
    getCategoriesForStorefront(),
    getFeaturedProducts(4),
    getNewArrivals(8),
  ]);

  const saleCandidates = [...newArrivals, ...featured].filter(
    (p) =>
      p.discount_price != null &&
      Number(p.discount_price) > 0 &&
      Number(p.discount_price) < Number(p.base_price)
  );
  const saleHint =
    saleCandidates.length > 0
      ? {
          label: saleCandidates[0].title,
          price: Math.min(
            ...saleCandidates.map((p) =>
              Number(p.discount_price ?? p.base_price)
            )
          ),
        }
      : null;

  return (
    <>
      <Hero />

      {/* Featured categories */}
      <section className="container py-14 sm:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Curated Edits"
            title="Shop by Category"
            linkHref="/shop"
            linkLabel="View all"
          />
        </Reveal>
        <CategoryGrid categories={categories.slice(0, 4)} />
      </section>

      {/* New arrivals */}
      <section className="bg-offwhite py-14 sm:py-20">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Just In"
              title="New Arrivals"
              linkHref="/shop?sort=newest"
              linkLabel="Shop new in"
            />
          </Reveal>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Premium offers / flash sale */}
      <EditorialBanner saleHint={saleHint} />

      {/* Featured grid */}
      {featured.length > 0 && (
        <section className="container pb-16 sm:pb-24">
          <Reveal>
            <SectionHeading
              eyebrow="Editor's Picks"
              title="Featured Pieces"
              align="center"
            />
          </Reveal>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* Soft CTA strip */}
      <section className="border-y border-border bg-offwhite py-12 sm:py-16">
        <div className="container flex flex-col items-center text-center">
          <BlurFade>
            <span className="eyebrow">Private Preview</span>
            <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
              New drops, every week
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Explore the latest branded pieces curated for Naz&apos;s Collection —
              limited sizes, fast shipping across Pakistan.
            </p>
            <Button asChild variant="gold" size="lg" className="mt-8 w-full max-w-xs sm:w-auto">
              <Link href="/shop?sort=newest">Browse New In</Link>
            </Button>
          </BlurFade>
        </div>
      </section>
    </>
  );
}
