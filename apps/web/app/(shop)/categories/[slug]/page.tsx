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
      title: "Danh mục không tồn tại",
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

        <div className="flex flex-col gap-8 md:flex-row">
          <ShopFilters categories={categories} query={query} basePath={`/categories/${slug}`} activeCategory={slug} />
          <section className="flex-1">
            <ShopMobileFilters categories={categories} query={query} basePath={`/categories/${slug}`} activeCategory={slug} />
            <ShopToolbar total={categoryResponse.meta.total} />
            <ProductGrid products={category.products} />
            <div className="mt-12 flex items-center justify-center">
              <Pagination totalPages={categoryResponse.meta.totalPages} currentPage={categoryResponse.meta.page} />
            </div>
          </section>
        </div>
      </main>
  );
}
