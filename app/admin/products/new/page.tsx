import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/repositories/categories";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-charcoal"
      >
        <ChevronLeft className="h-3 w-3" /> Back to products
      </Link>
      <h1 className="mb-8 font-serif text-3xl tracking-tight">New Product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
