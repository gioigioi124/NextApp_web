"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Heart, ImageIcon, Loader2, ShoppingBag, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { WishlistItem } from "@/types/cart";
import { formatPrice } from "shared-utils";

function WishlistProductCard({ item }: { item: WishlistItem }) {
  const product = item.product;
  const addItem = useCartStore((state) => state.addItem);
  const removeProduct = useWishlistStore((state) => state.removeProduct);
  const image = product.images?.[0]?.url;
  const price = Number(product.salePrice || product.price);

  return (
    <article className="grid overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] bg-muted">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </Link>
      <div className="grid gap-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold uppercase text-muted-foreground">
            {product.category?.name || product.tags?.[0] || "Lumina"}
          </p>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {(product.averageRating || 0).toFixed(1)}
          </span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-bold text-foreground">{formatPrice(price)}</span>
          {product.salePrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(Number(product.price))}
            </span>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Button
            className="h-10 rounded-lg"
            disabled={product.stock <= 0}
            onClick={async () => {
              try {
                await addItem(product, 1);
                toast.success(`Da them ${product.name} vao gio hang`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Khong the them vao gio hang");
              }
            }}
          >
            <ShoppingBag className="size-4" />
            {product.stock > 0 ? "Them vao gio" : "Het hang"}
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-lg bg-background"
            onClick={async () => {
              try {
                await removeProduct(product.id);
                toast.success("Da xoa khoi wishlist");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Khong the xoa san pham");
              }
            }}
          >
            <Trash2 className="size-4" />
            Xoa khoi wishlist
          </Button>
        </div>
      </div>
    </article>
  );
}

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
            <WishlistProductCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </main>
  );
}
