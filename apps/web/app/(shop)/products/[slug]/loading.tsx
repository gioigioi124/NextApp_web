import { ProductGridSkeleton } from "@/components/product/product-skeleton";

export default function ProductDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-lg bg-muted" />
        <div className="h-96 rounded-lg bg-muted" />
      </div>
      <div className="mt-12">
        <ProductGridSkeleton />
      </div>
    </main>
  );
}
