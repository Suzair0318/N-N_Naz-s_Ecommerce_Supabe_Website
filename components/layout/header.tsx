"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { selectItemCount, useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

interface NavCategory {
  name: string;
  slug: string;
}

export function Header({ categories }: { categories: NavCategory[] }) {
  const router = useRouter();
  const setCartOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const wishlistItems = useWishlist((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = mounted ? selectItemCount(items) : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all",
        scrolled
          ? "border-border bg-white/85 backdrop-blur-xl"
          : "border-transparent bg-white"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <Link href="/shop" className="text-sm uppercase tracking-wide">
                  All Products
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop?category=${c.slug}`}
                    className="text-sm uppercase tracking-wide text-muted-foreground hover:text-charcoal"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Left nav (desktop) */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/shop" className="text-xs uppercase tracking-widest link-gold">
            Shop All
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="text-xs uppercase tracking-widest link-gold"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-xl tracking-[0.2em] text-gold sm:text-2xl"
        >
          NAZ&apos;S
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={submitSearch} className="hidden items-center md:flex">
            <div className="flex items-center border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-28 bg-transparent px-2 py-1 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </form>

          <Link href="/account" aria-label="Account" className="hidden sm:block">
            <User className="h-5 w-5 transition-colors hover:text-gold" />
          </Link>

          <Link href="/wishlist" aria-label="Wishlist" className="relative">
            <Heart className="h-5 w-5 transition-colors hover:text-gold" />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-charcoal">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative"
          >
            <ShoppingBag className="h-5 w-5 transition-colors hover:text-gold" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-charcoal text-[10px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
