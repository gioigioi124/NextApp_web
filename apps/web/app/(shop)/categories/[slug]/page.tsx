import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/product/shop-filters";
import { ShopMobileFilters } from "@/components/product/shop-mobile-filters";
import { ShopToolbar } from "@/components/product/shop-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { getCategories, getCategoryBySlug } from "@/services/catalog.service";
import { absoluteUrl, siteConfig } from "@/lib/site";
import type { ProductQuery } from "@/types/storefront";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductQuery>;
};

export async function generateMetadata({
  params,
}: Pick<CategoryPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Danh muc khong ton tai",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} Lumina Bedding`;
  const description = category.description || siteConfig.description;
  const image = category.image || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/categories/${category.slug}`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/categories/${category.slug}`),
      siteName: siteConfig.name,
      images: [{ url: image, alt: category.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [{ data: categories }, categoryResponse] = await Promise.all([
    getCategories(),
    getCategoryBySlug(slug, { ...query, limit: "12" }),
  ]);

  if (!categoryResponse.data) notFound();

  const category = categoryResponse.data;

  return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_360px]">
            <div className="p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Danh mục</p>
              <h1 className="[font-family:var(--font-heading)] mt-2 text-4xl font-semibold text-foreground">
                {category.name}
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {category.description || "Các sản phẩm được chọn lọc theo cùng nhu cầu sử dụng và phong cách phòng ngủ."}
              </p>
            </div>
            {category.image ? (
              <img src={category.image} alt={category.name} className="h-64 w-full object-cover md:h-full" />
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">
            <ShopFilters categories={categories} query={query} basePath={`/categories/${slug}`} />
          </div>
          <section>
            <ShopMobileFilters categories={categories} query={query} basePath={`/categories/${slug}`} />
            <ShopToolbar total={categoryResponse.meta.total} />
            <ProductGrid products={category.products} />
            <Pagination totalPages={categoryResponse.meta.totalPages} currentPage={categoryResponse.meta.page} />
          </section>
        </div>
      </main>
  );
}
