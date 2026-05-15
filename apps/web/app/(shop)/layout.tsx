import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { getCategories, getFeaturedProducts } from "@/services/catalog.service";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ data: categories }, { data: suggestions }] = await Promise.all([
    getCategories(),
    getFeaturedProducts(6),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={categories} suggestions={suggestions} />
      {children}
      <StorefrontFooter categories={categories} />
    </div>
  );
}
