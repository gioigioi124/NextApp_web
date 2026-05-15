import Link from "next/link";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopToolbar } from "@/components/product/shop-toolbar";
import { getCategories, getProducts } from "@/services/catalog.service";
import type { ProductQuery } from "@/types/storefront";

const popularSearches = ["cotton", "nệm", "gối memory", "chăn hè", "bộ chăn ga"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<ProductQuery & { q?: string }>;
}) {
  const query = await searchParams;
  const keyword = query.q || query.search || "";
  const [{ data: categories }, products] = await Promise.all([
    getCategories(),
    getProducts({ ...query, search: keyword, limit: "12" }),
  ]);

  return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Search className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Tìm kiếm sản phẩm</p>
                  <h1 className="[font-family:var(--font-heading)] mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
                    {keyword ? `Kết quả cho “${keyword}”` : "Bạn đang tìm gì hôm nay?"}
                  </h1>
                </div>
              </div>

              <form action="/search" className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  name="q"
                  defaultValue={keyword}
                  placeholder="Nhập tên sản phẩm, chất liệu hoặc danh mục"
                  className="h-12 flex-1 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                <button
                  className="h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  type="submit"
                >
                  Tìm kiếm
                </button>
              </form>

              <div className="mt-5 flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <Link
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary/10 hover:text-secondary"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                {keyword
                  ? `Tìm thấy ${products.meta.total} sản phẩm phù hợp.`
                  : "Gợi ý: tìm theo chất liệu, kích thước, công năng hoặc tên danh mục."}
              </p>
            </div>

            <div className="border-t border-border bg-muted/50 p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                <TrendingUp className="size-4 text-primary" />
                Danh mục nhanh
              </div>
              <div className="mt-4 grid gap-2">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="flex items-center justify-between rounded-lg bg-card px-3 py-3 text-sm shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:text-primary"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Sparkles className="size-4 text-secondary" />
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{category._count?.products || 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ShopToolbar total={products.meta.total} />
        <ProductGrid products={products.data} />
      </main>
  );
}
