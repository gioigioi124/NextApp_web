"use client";

import { useState } from "react";
import { ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/storefront";

type ProductDetailActionsProps = {
  product: Product;
};

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock > 0;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">So luong</h3>
          <p className="mt-1 text-xs text-muted-foreground">Con {product.stock} san pham</p>
        </div>
        <QuantitySelector max={product.stock || 1} value={quantity} onChange={setQuantity} />
      </div>
      <Button
        className="h-12 rounded-lg bg-primary text-base"
        disabled={!inStock}
        onClick={async () => {
          try {
            await addItem(product, quantity);
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
