import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/repositories/categories";
import { getAdminProductById } from "@/lib/repositories/admin";
import type { ProductImage, ProductVariant } from "@/lib/types";
import type { ProductFormValues } from "@/lib/validators/product";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    getAdminProductById(params.id),
    getCategories(),
  ]);

  if (!product) notFound();

  const typed = product as typeof product & {
    images: ProductImage[];
    variants: ProductVariant[];
  };

  const defaultValues: Partial<ProductFormValues> = {
    title: typed.title,
    slug: typed.slug,
    description: typed.description ?? "",
    brand_name: typed.brand_name ?? "",
    weight: typed.weight != null ? Number(typed.weight) : null,
    category_id: typed.category_id,
    base_price: Number(typed.base_price),
    discount_price: typed.discount_price ? Number(typed.discount_price) : null,
    featured: typed.featured,
    is_active: typed.is_active,
    images: [...typed.images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((i) => i.image_url),
    variants: typed.variants.map((v) => ({
      size: v.size,
      stock_quantity: v.stock_quantity,
      price_override: v.price_override,
    })),
  };

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-charcoal"
      >
        <ChevronLeft className="h-3 w-3" /> Back to products
      </Link>
      <h1 className="mb-8 font-serif text-3xl tracking-tight">
        Edit Product
      </h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        productId={typed.id}
        defaultValues={defaultValues}
      />
    </div>
  );
}
