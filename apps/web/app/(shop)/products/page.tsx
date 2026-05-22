import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/product/shop-filters";
import { ShopMobileFilters } from "@/components/product/shop-mobile-filters";
import { ShopToolbar } from "@/components/product/shop-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { getCategories, getProducts } from "@/services/catalog.service";
import type { ProductQuery } from "@/types/storefront";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductQuery>;
}) {
  const query = await searchParams;
  const [{ data: categories }, products] = await Promise.all([
    getCategories(),
    getProducts({ ...query, limit: "12" }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <ShopFilters categories={categories} query={query} basePath="/products" />
        
        {/* Main Content */}
        <section className="flex-1">
          <ShopMobileFilters categories={categories} query={query} basePath="/products" />
          <ShopToolbar total={products.meta.total} />
          <ProductGrid products={products.data} />
          <div className="mt-12 flex items-center justify-center">
            <Pagination totalPages={products.meta.totalPages} currentPage={products.meta.page} />
          </div>
        </section>
      </div>
    </main>
  );
}
