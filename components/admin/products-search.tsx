"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductsSearch({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const applySearch = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/admin/products?${qs}` : "/admin/products");
    });
  };

  return (
    <form
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        applySearch(value);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by title, brand, category, or description"
          className="h-11 pl-9 pr-9"
          aria-label="Search products"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal"
            onClick={() => {
              setValue("");
              applySearch("");
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" className="h-11 sm:w-28" disabled={isPending}>
        {isPending ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
