"use client";

import Image from "next/image";
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

export interface HeaderUser {
  fullName: string | null;
  email: string;
  role: string;
}

function getDisplayName(user: HeaderUser) {
  const fromName = user.fullName?.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const local = user.email.split("@")[0];
  return local || "Account";
}

function getInitials(user: HeaderUser) {
  const name = user.fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "ME";
}

export function Header({
  categories,
  user,
}: {
  categories: NavCategory[];
  user: HeaderUser | null;
}) {
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
  const displayName = user ? getDisplayName(user) : null;
  const initials = user ? getInitials(user) : null;

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

              <div className="mt-10 border-t border-border pt-6">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold bg-gold/15 text-xs font-medium tracking-wide text-charcoal">
                        {initials}
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                          aria-hidden
                        />
                      </span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Signed in
                      </span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="block text-xs uppercase tracking-widest text-gold"
                      >
                        Admin panel
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm uppercase tracking-widest link-gold"
                  >
                    <User className="h-4 w-4" />
                    Sign in
                  </Link>
                )}
              </div>
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

        {/* Brand */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 sm:gap-3"
          aria-label="N&N Naz's Collection — Home"
        >
          <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-charcoal shadow-sm sm:h-11 sm:w-11">
            <Image
              src="/nazs-logo.png"
              alt=""
              fill
              priority
              sizes="44px"
              quality={90}
              className="object-cover object-center"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-serif text-sm tracking-tight text-charcoal sm:text-base md:text-lg">
              N&amp;N Naz&apos;s Collection
            </span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-4">
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

          {user ? (
            <Link
              href="/account"
              className="group relative hidden sm:flex"
              aria-label={`Signed in as ${displayName}`}
              title={`Signed in as ${user.email || displayName}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gold/15 text-[11px] font-medium tracking-wide text-charcoal transition-colors group-hover:bg-gold/25">
                {initials}
              </span>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 text-xs uppercase tracking-widest link-gold sm:flex"
            >
              <User className="h-4 w-4" />
              Sign in
            </Link>
          )}

          {/* Compact auth control for very small screens */}
          {user ? (
            <Link
              href="/account"
              aria-label={`Signed in as ${displayName}`}
              className="relative sm:hidden"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gold/15 text-[11px] font-medium text-charcoal">
                {initials}
              </span>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
              />
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              className="sm:hidden"
            >
              <User className="h-5 w-5 transition-colors hover:text-gold" />
            </Link>
          )}

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
