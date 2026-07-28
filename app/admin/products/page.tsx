import Link from "next/link";
import { Suspense } from "react";

import { Pencil, Plus } from "lucide-react";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductsSearch } from "@/components/admin/products-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const products = await getAdminProducts(q);

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {q
              ? `${products.length} result${products.length === 1 ? "" : "s"} for “${q}”`
              : `${products.length} products in your catalog.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> New Product
          </Link>
        </Button>
      </div>

      <Suspense fallback={null}>
        <ProductsSearch initialQuery={q} />
      </Suspense>

      <div className="border border-border bg-white">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {q
              ? `No products match “${q}”. Try another title, brand, category, or description.`
              : "No products yet. Create your first product."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-4">Product</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stock = product.variants.reduce(
                    (sum, v) => sum + v.stock_quantity,
                    0
                  );
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border align-middle last:border-0"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-10 shrink-0 bg-muted" />
                          <div>
                            <div className="font-medium">{product.title}</div>
                            <div className="text-xs text-muted-foreground">
                              /{product.slug}
                              {product.weight != null
                                ? ` · ${Number(product.weight)} g`
                                : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.brand_name ?? "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="p-4">{formatPrice(product.base_price)}</td>
                      <td className="p-4">
                        <span className={stock <= 3 ? "text-destructive" : ""}>
                          {stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={product.is_active ? "gold" : "muted"}>
                          {product.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            aria-label="Edit product"
                          >
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteProductButton
                            productId={product.id}
                            productTitle={product.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
