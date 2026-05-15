import { ProductGridSkeleton } from "@/components/product/product-skeleton";

export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-4 h-10 w-full max-w-lg rounded bg-muted" />
        <div className="mt-3 h-5 w-full max-w-2xl rounded bg-muted" />
      </div>
      <ProductGridSkeleton />
    </main>
  );
}
