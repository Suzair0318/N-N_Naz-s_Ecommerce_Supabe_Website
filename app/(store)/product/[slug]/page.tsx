import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getNewArrivals, getProductBySlug } from "@/lib/repositories/products";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = (await getNewArrivals(8)).filter((p) => p.id !== product.id);

  return (
    <>
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="container border-t border-border py-16">
          <SectionHeading eyebrow="You may also like" title="Complete the Edit" />
          <ProductGrid products={related.slice(0, 4)} />
        </section>
      )}
    </>
  );
}
