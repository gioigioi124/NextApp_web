import { ProductGridSkeleton } from "@/components/product/product-skeleton";

export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-28 rounded-lg bg-muted" />
      <ProductGridSkeleton />
    </main>
  );
}
