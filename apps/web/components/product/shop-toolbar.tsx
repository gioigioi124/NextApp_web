"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

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
    <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl bg-card p-4 shadow-sm md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          Hiển thị tổng cộng <span className="font-bold text-foreground">{total}</span> sản phẩm
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-border pr-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Sắp xếp:</span>
          <select
            value={currentSort}
            onChange={(event) => updateSort(event.target.value)}
            className="cursor-pointer border-none bg-transparent text-sm font-semibold focus:ring-0"
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="createdAt:desc">Mới nhất</option>
            <option value="popular:desc">Phổ biến nhất</option>
            <option value="price:asc">Giá thấp đến cao</option>
            <option value="price:desc">Giá cao đến thấp</option>
            <option value="name:asc">Tên A-Z</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded bg-primary/10 p-1.5 text-primary shadow-inner">
            <LayoutGrid className="size-5" />
          </button>
          <button className="p-1.5 text-muted-foreground transition-colors hover:text-primary">
            <List className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
