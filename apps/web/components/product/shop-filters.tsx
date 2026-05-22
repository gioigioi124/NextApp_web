import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category, ProductQuery } from "@/types/storefront";

type ShopFiltersProps = {
  categories: Category[];
  query: ProductQuery;
  basePath: string;
  activeCategory?: string;
};

const priceRanges = [
  { label: "Dưới 1 triệu", minPrice: "0", maxPrice: "1000000" },
  { label: "1 - 2 triệu", minPrice: "1000000", maxPrice: "2000000" },
  { label: "2 - 5 triệu", minPrice: "2000000", maxPrice: "5000000" },
  { label: "Trên 5 triệu", minPrice: "5000000" },
];

const ratings = ["5", "4", "3"];

function hrefWithQuery(basePath: string, current: ProductQuery, updates: Partial<ProductQuery>) {
  const params = new URLSearchParams();
  const next = { ...current, ...updates, page: "1" };

  Object.entries(next).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function ShopFilters({ categories, query, basePath, activeCategory }: ShopFiltersProps) {
  const activeCount = ["category", "minPrice", "maxPrice", "rating", "search"].filter(
    (key) => Boolean(query[key as keyof ProductQuery]),
  ).length;

  return (
    <aside className="hide-scrollbar sticky top-28 hidden h-[calc(100vh-140px)] w-64 shrink-0 self-start overflow-y-auto md:block">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Bộ lọc</h2>
        {activeCount > 0 && (
          <Link
            href="/products"
            className="text-[13px] font-semibold tracking-wider text-secondary hover:underline"
          >
            Xóa tất cả
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Accordion */}
        <div className="border-b border-border pb-4">
          <div className="mb-3 flex cursor-pointer items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Danh mục</span>
            <ChevronDown className="size-4" />
          </div>
          <div className="space-y-2">
            {categories.map((category) => {
              const isActive = activeCategory === category.slug || query.category === category.slug;
              const nextBasePath = isActive ? "/products" : `/categories/${category.slug}`;
              const href = hrefWithQuery(nextBasePath, query, isActive ? { category: "" } : {});
              
              return (
                <Link
                  key={category.id}
                  href={href}
                  className="group flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={isActive}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className={`text-base transition-colors group-hover:text-primary ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {category.name} ({category._count?.products || 0})
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Price Accordion */}
        <div className="border-b border-border pb-4">
          <div className="mb-3 flex cursor-pointer items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Khoảng giá</span>
            <ChevronDown className="size-4" />
          </div>
          <div className="space-y-2">
            {priceRanges.map((range) => {
              const isActive = query.minPrice === range.minPrice && query.maxPrice === range.maxPrice;
              return (
                <Link
                  key={range.label}
                  href={hrefWithQuery(basePath, query, {
                    minPrice: isActive ? "" : range.minPrice,
                    maxPrice: isActive ? "" : range.maxPrice,
                  })}
                  className="group flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={isActive}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className={`text-base transition-colors group-hover:text-primary ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {range.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Rating Accordion */}
        <div className="border-b border-border pb-4">
          <div className="mb-3 flex cursor-pointer items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Đánh giá</span>
            <ChevronDown className="size-4" />
          </div>
          <div className="space-y-2">
            {ratings.map((rating) => {
              const isActive = query.rating === rating;
              return (
                <Link
                  key={rating}
                  href={hrefWithQuery(basePath, query, { rating: isActive ? "" : rating })}
                  className="group flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={isActive}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className={`text-base transition-colors group-hover:text-primary ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    Từ {rating} sao
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
