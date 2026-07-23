import { Suspense } from "react";

import { Reveal } from "@/components/motion/reveal";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories } from "@/lib/repositories/categories";
import {
  getPriceBounds,
  getProductsByFilters,
} from "@/lib/repositories/products";
import type { ShopFilters as Filters } from "@/lib/types";

export const metadata = { title: "Shop" };

interface ShopPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sort = param(searchParams.sort) as Filters["sort"] | undefined;

  const filters: Filters = {
    category: param(searchParams.category),
    search: param(searchParams.search),
    sizes: param(searchParams.sizes)?.split(",").filter(Boolean),
    maxPrice: searchParams.maxPrice
      ? Number(param(searchParams.maxPrice))
      : undefined,
    inStock: param(searchParams.inStock) === "true",
    sort,
  };

  const [products, categories, priceBounds] = await Promise.all([
    getProductsByFilters(filters),
    getCategories(),
    getPriceBounds(),
  ]);

  const activeCategory = categories.find((c) => c.slug === filters.category);
  const heading = filters.search
    ? `Results for "${filters.search}"`
    : activeCategory?.name ?? "All Products";

  return (
    <div className="container max-w-full overflow-x-hidden py-12">
      <Reveal className="mb-8">
        <span className="eyebrow">The Collection</span>
        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <Suspense
          fallback={
            <div className="h-12 animate-pulse bg-muted lg:h-64" aria-hidden />
          }
        >
          <ShopFilters
            categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
            priceBounds={priceBounds}
          />
        </Suspense>
        <ProductGrid
          products={products}
          className="grid-cols-2 lg:grid-cols-3"
          emptyMessage="No pieces match your filters. Try adjusting your selection."
        />
      </div>
    </div>
  );
}
