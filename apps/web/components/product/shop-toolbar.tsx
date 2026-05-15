"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ShopToolbarProps = {
  total: number;
};

export function ShopToolbar({ total }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = `${searchParams.get("sort") || "createdAt"}:${searchParams.get("order") || "desc"}`;

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const [sort, order] = value.split(":");

    if (sort === "createdAt") {
      params.delete("sort");
      params.delete("order");
    } else {
      params.set("sort", sort);
      params.set("order", order);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">Hiển thị {total} sản phẩm</p>
        <p className="text-xs text-muted-foreground">Sắp xếp và tinh chỉnh bộ lọc để tìm nhanh hơn.</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={currentSort}
          onChange={(event) => updateSort(event.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          aria-label="Sắp xếp sản phẩm"
        >
          <option value="createdAt:desc">Mới nhất</option>
          <option value="price:asc">Giá thấp đến cao</option>
          <option value="price:desc">Giá cao đến thấp</option>
          <option value="popular:desc">Bán chạy</option>
          <option value="name:asc">Tên A-Z</option>
        </select>
      </div>
    </div>
  );
}
