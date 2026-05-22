"use client";

import Link from "next/link";
import { ImageIcon, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/product/wishlist-button";
import type { Product } from "@/types/storefront";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "shared-utils";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

function getDiscountPercent(product: Product) {
  if (!product.salePrice) return null;

  const price = Number(product.price);
  const salePrice = Number(product.salePrice);
  if (!price || salePrice >= price) return null;

  return Math.round(((price - salePrice) / price) * 100);
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const images = product.images || [];
  const primaryImage = images[0]?.url;
  const hoverImage = images[1]?.url || primaryImage;
  const discount = getDiscountPercent(product);
  const currentPrice = Number(product.salePrice || product.price);

  return (
    <div className="product-card group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={images[0]?.alt || product.name}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                  hoverImage !== primaryImage && "group-hover:opacity-0",
                )}
              />
              {hoverImage !== primaryImage ? (
                <img
                  src={hoverImage}
                  alt={images[1]?.alt || product.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="size-8 text-muted-foreground opacity-20" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount ? (
            <span className="rounded-lg bg-accent px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
              -{discount}%
            </span>
          ) : null}
          {product.isFeatured ? (
            <span className="rounded-lg bg-secondary px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
              NEW
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <WishlistButton
          productId={product.id}
          iconOnly
          className="absolute right-3 top-3 h-8 w-8 rounded-lg bg-white/90 text-muted-foreground shadow-sm backdrop-blur transition-all hover:text-destructive active:scale-95"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50"
            onClick={async (e) => {
              e.preventDefault();
              try {
                await addItem(product, 1);
                toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng");
              }
            }}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="size-4" />
            {product.stock > 0 ? "THÊM VÀO GIỎ" : "HẾT HÀNG"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {product.category?.name || product.tags?.[0] || "Lumina Premium"}
        </p>
        
        <Link
          href={`/products/${product.slug}`}
          className="mb-3 line-clamp-2 min-h-10 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-auto">
          <div className="mb-3 flex items-center gap-1.5">
            <div className="flex shrink-0 items-center text-warning">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <Star className="size-3.5 fill-amber-400 text-amber-400 opacity-30" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-primary">{formatPrice(currentPrice)}</span>
            {product.salePrice ? (
              <span className="text-sm font-medium text-muted-foreground line-through">{formatPrice(Number(product.price))}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
