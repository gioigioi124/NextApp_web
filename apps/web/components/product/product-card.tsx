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
    <Card className="group overflow-hidden rounded-lg border border-border bg-card py-0 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={images[0]?.alt || product.name}
                className={cn(
                  "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                  hoverImage !== primaryImage && "group-hover:opacity-0",
                )}
              />
              {hoverImage !== primaryImage ? (
                <img
                  src={hoverImage}
                  alt={images[1]?.alt || product.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
          )}
        </Link>

        <div className="absolute left-2 top-2 flex gap-1">
          {discount ? (
            <Badge className="rounded-md bg-accent px-2 py-1 text-xs text-white">-{discount}%</Badge>
          ) : null}
          {product.isFeatured ? (
            <Badge className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">Ban chay</Badge>
          ) : null}
        </div>

        <WishlistButton
          productId={product.id}
          iconOnly
          className="absolute right-2 top-2 rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
        />

        <div className="absolute inset-x-2 bottom-2 translate-y-14 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            type="button"
            className="h-10 w-full rounded-lg bg-primary text-primary-foreground shadow-lg"
            onClick={async () => {
              try {
                await addItem(product, 1);
                toast.success(`Da them ${product.name} vao gio hang`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Khong the them vao gio hang");
              }
            }}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="size-4" />
            {product.stock > 0 ? "Them vao gio" : "Het hang"}
          </Button>
        </div>
      </div>

      <CardContent className={cn("space-y-2 p-3", compact && "p-2")}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold uppercase text-muted-foreground">
            {product.category?.name || product.tags?.[0] || "Lumina"}
          </p>
          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>{(product.averageRating || 0).toFixed(1)}</span>
            <span>({product.reviewCount || 0})</span>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground transition hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatPrice(currentPrice)}</span>
          {product.salePrice ? (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(Number(product.price))}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
