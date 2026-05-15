import Link from "next/link";
import { Filter, Star, X } from "lucide-react";
import type { Category, ProductQuery } from "@/types/storefront";
import { Badge } from "@/components/ui/badge";

type ShopFiltersProps = {
  categories: Category[];
  query: ProductQuery;
  basePath: string;
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

function clearFilter(current: ProductQuery, key: keyof ProductQuery) {
  const next = { ...current };
  delete next[key];
  return next;
}

export function ShopFilters({ categories, query, basePath }: ShopFiltersProps) {
  const activeCount = ["category", "minPrice", "maxPrice", "rating", "search"].filter(
    (key) => Boolean(query[key as keyof ProductQuery]),
  ).length;

  return (
    <aside className="space-y-5 rounded-lg border border-border bg-card p-4 shadow-sm lg:sticky lg:top-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
          <Filter className="size-4 text-primary" />
          Bộ lọc
        </div>
        {activeCount ? (
          <Badge variant="secondary" className="rounded-full">{activeCount}</Badge>
        ) : null}
      </div>

      {activeCount ? (
        <div className="flex flex-wrap gap-2">
          {query.search ? (
            <Link href={hrefWithQuery(basePath, clearFilter(query, "search"), {})}>
              <Badge variant="outline" className="gap-1 rounded-full">
                {query.search}
                <X className="size-3" />
              </Badge>
            </Link>
          ) : null}
          {query.rating ? (
            <Link href={hrefWithQuery(basePath, clearFilter(query, "rating"), {})}>
              <Badge variant="outline" className="gap-1 rounded-full">
                Từ {query.rating} sao
                <X className="size-3" />
              </Badge>
            </Link>
          ) : null}
          {(query.minPrice || query.maxPrice) ? (
            <Link href={hrefWithQuery(basePath, { ...clearFilter(clearFilter(query, "minPrice"), "maxPrice") }, {})}>
              <Badge variant="outline" className="gap-1 rounded-full">
                Khoảng giá
                <X className="size-3" />
              </Badge>
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">Danh mục</h3>
        <div className="grid gap-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>{category.name}</span>
              <span className="text-xs">{category._count?.products || 0}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">Khoảng giá</h3>
        <div className="grid gap-2">
          {priceRanges.map((range) => (
            <Link
              key={range.label}
              href={hrefWithQuery(basePath, query, {
                minPrice: range.minPrice,
                maxPrice: range.maxPrice,
              })}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">Đánh giá</h3>
        <div className="grid gap-2">
          {ratings.map((rating) => (
            <Link
              key={rating}
              href={hrefWithQuery(basePath, query, { rating })}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span className="flex">
                {Array.from({ length: Number(rating) }, (_, index) => (
                  <Star key={index} className="size-3 fill-amber-400 text-amber-400" />
                ))}
              </span>
              trở lên
            </Link>
          ))}
        </div>
      </div>

      {activeCount ? (
        <Link
          href={basePath}
          className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted"
        >
          Xóa bộ lọc
        </Link>
      ) : null}
    </aside>
  );
}
