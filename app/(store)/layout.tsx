import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getCategories } from "@/lib/repositories/categories";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AnnouncementBar />
      <Header
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
