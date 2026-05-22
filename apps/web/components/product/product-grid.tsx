import type { Product } from "@/types/storefront";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">Không tìm thấy sản phẩm phù hợp</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Hãy thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
