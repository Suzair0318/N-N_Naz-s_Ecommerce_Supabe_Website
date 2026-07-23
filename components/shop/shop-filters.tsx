"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SIZES } from "@/constants/shop";
import { cn, formatPrice } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  categories: Category[];
  priceBounds: { min: number; max: number };
}

export function ShopFilters({ categories, priceBounds }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );

  const selectedCategory = searchParams.get("category") ?? "";
  const selectedSizes = useMemo(
    () => new Set((searchParams.get("sizes") ?? "").split(",").filter(Boolean)),
    [searchParams]
  );
  const inStock = searchParams.get("inStock") === "true";
  const maxPrice = Number(searchParams.get("maxPrice") ?? priceBounds.max);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleSet = (set: Set<string>, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return Array.from(next).join(",");
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedSizes.size ||
      inStock ||
      searchParams.get("maxPrice") ||
      searchParams.get("search")
  );

  const activeFilterCount = [
    selectedCategory ? 1 : 0,
    selectedSizes.size > 0 ? 1 : 0,
    inStock ? 1 : 0,
    searchParams.get("maxPrice") ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ search: searchValue.trim() || null });
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push(pathname, { scroll: false });
  };

  const panel = (
    <FilterPanel
      categories={categories}
      priceBounds={priceBounds}
      selectedCategory={selectedCategory}
      selectedSizes={selectedSizes}
      inStock={inStock}
      maxPrice={maxPrice}
      hasActiveFilters={hasActiveFilters}
      onClear={clearFilters}
      onSetParams={setParams}
      onToggleSize={(size) =>
        setParams({ sizes: toggleSet(selectedSizes, size) || null })
      }
      checkboxIdPrefix="desktop"
    />
  );

  return (
    <div className="contents">
      {/* Mobile: search + filter button */}
      <div className="mb-2 flex gap-2 lg:hidden">
        <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </form>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-11 w-11 shrink-0"
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-charcoal px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-full"
          >
            <SheetHeader className="border-b border-border p-5 text-left">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel
                categories={categories}
                priceBounds={priceBounds}
                selectedCategory={selectedCategory}
                selectedSizes={selectedSizes}
                inStock={inStock}
                maxPrice={maxPrice}
                hasActiveFilters={hasActiveFilters}
                onClear={clearFilters}
                onSetParams={setParams}
                onToggleSize={(size) =>
                  setParams({ sizes: toggleSet(selectedSizes, size) || null })
                }
                checkboxIdPrefix="mobile"
                hideTitle
              />
            </div>
            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">{panel}</aside>
    </div>
  );
}

function FilterPanel({
  categories,
  priceBounds,
  selectedCategory,
  selectedSizes,
  inStock,
  maxPrice,
  hasActiveFilters,
  onClear,
  onSetParams,
  onToggleSize,
  checkboxIdPrefix,
  hideTitle = false,
}: {
  categories: Category[];
  priceBounds: { min: number; max: number };
  selectedCategory: string;
  selectedSizes: Set<string>;
  inStock: boolean;
  maxPrice: number;
  hasActiveFilters: boolean;
  onClear: () => void;
  onSetParams: (updates: Record<string, string | null>) => void;
  onToggleSize: (size: string) => void;
  checkboxIdPrefix: string;
  hideTitle?: boolean;
}) {
  const stockId = `${checkboxIdPrefix}-inStock`;

  return (
    <div className="space-y-8">
      {!hideTitle && (
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg">Filters</h3>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-charcoal"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}

      {hideTitle && hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-charcoal"
        >
          <X className="h-3 w-3" /> Clear all
        </button>
      )}

      <div className="space-y-3 border-t border-border pt-6">
        <p className="eyebrow">Category</p>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => onSetParams({ category: null })}
              className={cn(
                "text-sm",
                !selectedCategory ? "text-gold" : "text-charcoal hover:text-gold"
              )}
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => onSetParams({ category: c.slug })}
                className={cn(
                  "text-sm",
                  selectedCategory === c.slug
                    ? "text-gold"
                    : "text-charcoal hover:text-gold"
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <p className="eyebrow">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onToggleSize(size)}
              className={cn(
                "min-w-[2.75rem] border px-2 py-1.5 text-xs",
                selectedSizes.has(size)
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-border hover:border-charcoal"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Max Price</p>
          <span className="text-sm text-muted-foreground">
            {formatPrice(maxPrice)}
          </span>
        </div>
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          step={10}
          value={[maxPrice]}
          onValueChange={([v]) =>
            onSetParams({
              maxPrice: v >= priceBounds.max ? null : String(v),
            })
          }
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Checkbox
          id={stockId}
          checked={inStock}
          onCheckedChange={(v) => onSetParams({ inStock: v ? "true" : null })}
        />
        <label htmlFor={stockId} className="text-sm">
          In stock only
        </label>
      </div>
    </div>
  );
}
