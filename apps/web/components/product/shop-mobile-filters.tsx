"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category, ProductQuery } from "@/types/storefront";
import { ShopFilters } from "./shop-filters";

type ShopMobileFiltersProps = {
  categories: Category[];
  query: ProductQuery;
  basePath: string;
  activeCategory?: string;
};

export function ShopMobileFilters({ categories, query, basePath, activeCategory }: ShopMobileFiltersProps) {
  return (
    <div className="mb-4 lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" className="h-10 gap-2">
              <SlidersHorizontal className="size-4" />
              Lọc sản phẩm
            </Button>
          }
        />
        <SheetContent side="left" className="w-80 max-w-[92vw] overflow-y-auto bg-background p-0">
          <SheetHeader>
            <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <ShopFilters categories={categories} query={query} basePath={basePath} activeCategory={activeCategory} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
