"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useWishlistStore((state) => state.items);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist().catch(() => undefined);
    }
  }, [fetchWishlist, isAuthenticated]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Lumina wishlist</p>
          <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold text-foreground sm:text-4xl">
            San pham yeu thich
          </h1>
        </div>
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted"
        >
          Tiep tuc mua hang
        </Link>
      </div>

      {!isAuthenticated ? (
        <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Heart className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Dang nhap de xem wishlist</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Wishlist duoc luu theo tai khoan de ban co the xem lai tren nhieu thiet bi.
          </p>
          <Button className="mt-5">
            <Link href="/login?next=/wishlist">Dang nhap</Link>
          </Button>
        </section>
      ) : isLoading && items.length === 0 ? (
        <section className="flex min-h-96 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </section>
      ) : items.length === 0 ? (
        <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Heart className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Chua co san pham yeu thich</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Nhan bieu tuong trai tim tren san pham de luu vao danh sach nay.
          </p>
          <Button className="mt-5">
            <Link href="/products">Kham pha san pham</Link>
          </Button>
        </section>
      ) : (
        <section className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </section>
      )}
    </main>
  );
}
