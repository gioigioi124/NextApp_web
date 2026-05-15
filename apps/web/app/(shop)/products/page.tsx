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
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Cửa hàng</p>
          <h1 className="[font-family:var(--font-heading)] mt-2 text-4xl font-semibold text-foreground">
            Tất cả sản phẩm
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Khám phá chăn ga, gối, nệm và phụ kiện ngủ được chọn lọc cho cảm giác thoải mái mỗi ngày.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">
            <ShopFilters categories={categories} query={query} basePath="/products" />
          </div>
          <section>
            <ShopMobileFilters categories={categories} query={query} basePath="/products" />
            <ShopToolbar total={products.meta.total} />
            <ProductGrid products={products.data} />
            <Pagination totalPages={products.meta.totalPages} currentPage={products.meta.page} />
          </section>
        </div>
      </main>
  );
}
