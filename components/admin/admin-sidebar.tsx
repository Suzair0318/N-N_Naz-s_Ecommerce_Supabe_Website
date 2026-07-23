"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-charcoal text-white lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 p-6">
        <Link href="/admin/dashboard" className="font-serif text-xl tracking-[0.2em] text-gold">
          NAZ&apos;S
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
          Admin Suite
        </p>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-3 lg:flex-col">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-white/10 text-gold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 transition-colors hover:text-gold"
        >
          <Store className="h-4 w-4" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
