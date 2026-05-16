"use client";

import { useState } from "react";
import { Ruler, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { WishlistButton } from "@/components/product/wishlist-button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/storefront";
import { formatPrice } from "shared-utils";

type ProductDetailActionsProps = {
  product: Product;
};

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const firstAvailableVariant = product.variants?.find((variant) => variant.stock > 0);
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailableVariant?.id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const selectedVariant = product.variants?.find((variant) => variant.id === selectedVariantId);
  const stock = selectedVariant?.stock ?? product.stock;
  const price = Number(selectedVariant?.price ?? product.salePrice ?? product.price);
  const inStock = stock > 0;

  const selectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  return (
    <div className="grid gap-3">
      {product.variants?.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Phan loai</h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Ruler className="size-3" />
              Bang kich thuoc
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const selected = variant.id === selectedVariantId;

              return (
                <button
                  key={variant.id}
                  className={cn(
                    "rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-primary hover:text-primary",
                    selected && "border-primary bg-primary/10 text-primary",
                    variant.stock <= 0 && "cursor-not-allowed opacity-45 hover:border-border hover:text-foreground",
                  )}
                  type="button"
                  onClick={() => selectVariant(variant.id)}
                  disabled={variant.stock <= 0}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {selectedVariant ? (
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Gia phan loai</p>
          <p className="mt-1 text-lg font-bold text-foreground">{formatPrice(price)}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">So luong</h3>
          <p className="mt-1 text-xs text-muted-foreground">Con {stock} san pham</p>
        </div>
        <QuantitySelector max={stock || 1} value={quantity} onChange={setQuantity} />
      </div>
      <Button
        className="h-12 rounded-lg bg-primary text-base"
        disabled={!inStock}
        onClick={async () => {
          try {
            await addItem(product, quantity, selectedVariantId);
            toast.success(`Da them ${product.name} vao gio hang`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Khong the them vao gio hang");
          }
        }}
      >
        <ShoppingBag className="size-5" />
        {inStock ? "Them vao gio hang" : "Het hang"}
      </Button>
      <Button
        variant="outline"
        className="h-12 rounded-lg bg-background text-base"
        onClick={() => toast.success("Da tao phien mua nhanh")}
      >
        <Zap className="size-5" />
        Mua ngay
      </Button>
      <WishlistButton productId={product.id} className="h-11 rounded-lg bg-background" />
    </div>
  );
}
