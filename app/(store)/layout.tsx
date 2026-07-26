import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getCurrentProfile } from "@/lib/auth";
import { getCategories } from "@/lib/repositories/categories";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, profile] = await Promise.all([
    getCategories(),
    getCurrentProfile(),
  ]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AnnouncementBar />
      <Header
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        user={
          profile
            ? {
                fullName: profile.full_name,
                email: profile.email ?? "",
                role: profile.role,
              }
            : null
        }
      />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
