"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  brands: string[];
  priceBounds: { min: number; max: number };
}

interface FilterDraft {
  category: string;
  brands: string[];
  sizes: string[];
  inStock: boolean;
  maxPrice: number;
}

function parseList(value: string | null) {
  return (value ?? "").split(",").filter(Boolean);
}

function draftFromParams(
  searchParams: URLSearchParams,
  priceMax: number
): FilterDraft {
  return {
    category: searchParams.get("category") ?? "",
    brands: parseList(searchParams.get("brands")),
    sizes: parseList(searchParams.get("sizes")),
    inStock: searchParams.get("inStock") === "true",
    maxPrice: Number(searchParams.get("maxPrice") ?? priceMax),
  };
}

function draftHasFilters(draft: FilterDraft, priceMax: number) {
  return Boolean(
    draft.category ||
      draft.brands.length ||
      draft.sizes.length ||
      draft.inStock ||
      draft.maxPrice < priceMax
  );
}

function draftActiveCount(draft: FilterDraft, priceMax: number) {
  return (
    (draft.category ? 1 : 0) +
    (draft.brands.length > 0 ? 1 : 0) +
    (draft.sizes.length > 0 ? 1 : 0) +
    (draft.inStock ? 1 : 0) +
    (draft.maxPrice < priceMax ? 1 : 0)
  );
}

export function ShopFilters({
  categories,
  brands,
  priceBounds,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );

  const applied = useMemo(
    () => draftFromParams(searchParams, priceBounds.max),
    [searchParams, priceBounds.max]
  );

  const [draft, setDraft] = useState<FilterDraft>(applied);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Sync draft from URL only while the sheet is closed (after navigation settles).
  useEffect(() => {
    if (open) return;
    setDraft(applied);
  }, [applied, open]);

  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const appliedCount = draftActiveCount(applied, priceBounds.max);

  const applyDraft = useCallback(
    (next: FilterDraft, search?: string | null) => {
      const params = new URLSearchParams();

      const q =
        search !== undefined
          ? search?.trim() || null
          : searchParams.get("search")?.trim() || null;
      if (q) params.set("search", q);

      if (next.category) params.set("category", next.category);
      if (next.brands.length) {
        params.set("brands", next.brands.join(","));
      }
      if (next.sizes.length) params.set("sizes", next.sizes.join(","));
      if (next.inStock) params.set("inStock", "true");
      if (next.maxPrice < priceBounds.max) {
        params.set("maxPrice", String(next.maxPrice));
      }

      const sort = searchParams.get("sort");
      if (sort) params.set("sort", sort);

      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      if (href === current) {
        // Same URL — still force a server refresh so results reload.
        router.refresh();
        return;
      }

      router.replace(href, { scroll: false });
    },
    [pathname, priceBounds.max, router, searchParams]
  );

  const openSheet = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(draftFromParams(searchParams, priceBounds.max));
    }
    setOpen(nextOpen);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyDraft(applied, searchValue.trim() || null);
  };

  const emptyDraft = (): FilterDraft => ({
    category: "",
    brands: [],
    sizes: [],
    inStock: false,
    maxPrice: priceBounds.max,
  });

  const clearApplied = () => {
    setSearchValue("");
    const cleared = emptyDraft();
    setDraft(cleared);
    router.replace(pathname, { scroll: false });
  };

  const showResults = () => {
    const snapshot: FilterDraft = {
      ...draftRef.current,
      brands: [...draftRef.current.brands],
      sizes: [...draftRef.current.sizes],
    };
    setOpen(false);
    applyDraft(snapshot);
  };

  return (
    <div className="contents">
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

        <Sheet open={open} onOpenChange={openSheet}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-11 w-11 shrink-0"
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
              {appliedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-charcoal px-1 text-[10px] text-white">
                  {appliedCount}
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
                brands={brands}
                priceBounds={priceBounds}
                draft={draft}
                onDraftChange={setDraft}
                checkboxIdPrefix="mobile"
                hideTitle
                onClearDraft={() => {
                  setDraft(emptyDraft());
                  clearApplied();
                  setOpen(false);
                }}
              />
            </div>
            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={showResults}>
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden lg:block">
        <DesktopFilters
          categories={categories}
          brands={brands}
          priceBounds={priceBounds}
          applied={applied}
          onApply={applyDraft}
          onClear={clearApplied}
        />
      </aside>
    </div>
  );
}

function DesktopFilters({
  categories,
  brands,
  priceBounds,
  applied,
  onApply,
  onClear,
}: {
  categories: Category[];
  brands: string[];
  priceBounds: { min: number; max: number };
  applied: FilterDraft;
  onApply: (draft: FilterDraft) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  const dirty =
    draft.category !== applied.category ||
    draft.inStock !== applied.inStock ||
    draft.maxPrice !== applied.maxPrice ||
    draft.brands.join(",") !== applied.brands.join(",") ||
    draft.sizes.join(",") !== applied.sizes.join(",");

  return (
    <div className="space-y-6">
      <FilterPanel
        categories={categories}
        brands={brands}
        priceBounds={priceBounds}
        draft={draft}
        onDraftChange={setDraft}
        checkboxIdPrefix="desktop"
        showClear={draftHasFilters(draft, priceBounds.max)}
        onClearDraft={() => {
          setDraft({
            category: "",
            brands: [],
            sizes: [],
            inStock: false,
            maxPrice: priceBounds.max,
          });
          onClear();
        }}
      />
      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={() => onApply(draft)}
          disabled={!dirty}
        >
          Apply filters
        </Button>
        {draftHasFilters(applied, priceBounds.max) && (
          <button
            type="button"
            onClick={onClear}
            className="w-full text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-charcoal"
          >
            Reset all
          </button>
        )}
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  brands,
  priceBounds,
  draft,
  onDraftChange,
  checkboxIdPrefix,
  hideTitle = false,
  showClear,
  onClearDraft,
}: {
  categories: Category[];
  brands: string[];
  priceBounds: { min: number; max: number };
  draft: FilterDraft;
  onDraftChange: (draft: FilterDraft) => void;
  checkboxIdPrefix: string;
  hideTitle?: boolean;
  showClear?: boolean;
  onClearDraft?: () => void;
}) {
  const stockId = `${checkboxIdPrefix}-inStock`;
  const brandSet = useMemo(() => new Set(draft.brands), [draft.brands]);
  const sizeSet = useMemo(() => new Set(draft.sizes), [draft.sizes]);
  const canClear = showClear ?? draftHasFilters(draft, priceBounds.max);

  const toggleBrand = (brand: string, checked: boolean) => {
    const next = new Set(brandSet);
    if (checked) next.add(brand);
    else next.delete(brand);
    onDraftChange({ ...draft, brands: Array.from(next) });
  };

  const toggleSize = (size: string) => {
    // Single-select: tap again to clear, otherwise replace.
    const next = draft.sizes[0] === size ? [] : [size];
    onDraftChange({ ...draft, sizes: next });
  };

  const clearDraft = () => {
    if (onClearDraft) {
      onClearDraft();
      return;
    }
    onDraftChange({
      category: "",
      brands: [],
      sizes: [],
      inStock: false,
      maxPrice: priceBounds.max,
    });
  };

  return (
    <div className="space-y-8">
      {!hideTitle && (
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg">Filters</h3>
          {canClear && (
            <button
              type="button"
              onClick={clearDraft}
              className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-charcoal"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}

      {hideTitle && canClear && (
        <button
          type="button"
          onClick={clearDraft}
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
              onClick={() => onDraftChange({ ...draft, category: "" })}
              className={cn(
                "text-sm",
                !draft.category ? "text-gold" : "text-charcoal hover:text-gold"
              )}
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => onDraftChange({ ...draft, category: c.slug })}
                className={cn(
                  "text-sm",
                  draft.category === c.slug
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

      {brands.length > 0 && (
        <div className="space-y-3 border-t border-border pt-6">
          <p className="eyebrow">Brand</p>
          <ul className="space-y-2.5">
            {brands.map((brand) => {
              const id = `${checkboxIdPrefix}-brand-${brand.replace(/\s+/g, "-").toLowerCase()}`;
              const checked = brandSet.has(brand);
              return (
                <li key={brand} className="flex items-center gap-3">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleBrand(brand, value === true)
                    }
                  />
                  <label htmlFor={id} className="cursor-pointer text-sm">
                    {brand}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-3 border-t border-border pt-6">
        <p className="eyebrow">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                "min-w-[2.75rem] border px-2 py-1.5 text-xs",
                sizeSet.has(size)
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
            {formatPrice(draft.maxPrice)}
          </span>
        </div>
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          step={1}
          value={[draft.maxPrice]}
          onValueChange={([v]) => onDraftChange({ ...draft, maxPrice: v })}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Checkbox
          id={stockId}
          checked={draft.inStock}
          onCheckedChange={(v) =>
            onDraftChange({ ...draft, inStock: Boolean(v) })
          }
        />
        <label htmlFor={stockId} className="text-sm">
          In stock only
        </label>
      </div>
    </div>
  );
}
