"use client";

import { useState, useEffect, useMemo } from "react";
import { Ruler, ShoppingBag, Zap, Check } from "lucide-react";
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
  const firstAvailableVariant = product.variants?.find(
    (variant) => variant.stock > 0,
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    firstAvailableVariant?.id,
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const hasStructuredVariants = product.variants?.some(v => v.options && (v.options["Kích thước"] || v.options["Màu sắc"]));

  const structuredData = useMemo(() => {
    if (!hasStructuredVariants || !product.variants) return null;
    const sizes = new Set<string>();
    const colors = new Map<string, { hex: string; images: string[] }>();

    product.variants.forEach(v => {
      const size = v.options?.["Kích thước"];
      const color = v.options?.["Màu sắc"];
      const hex = v.options?.colorCode;
      
      if (size) sizes.add(size);
      if (color) {
        let imgs: string[] = Array.isArray(v.options?.images) ? v.options.images : [];
        if (!imgs.length && v.image) imgs = [v.image];
        if (!colors.has(color)) colors.set(color, { hex: hex || "#ccc", images: imgs });
      }
    });

    return {
      sizes: Array.from(sizes),
      colors: Array.from(colors.entries()).map(([name, data]) => ({ name, ...data }))
    };
  }, [product.variants, hasStructuredVariants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(structuredData?.sizes[0] || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(structuredData?.colors[0]?.name || null);

  const flatSelectedVariant = product.variants?.find((variant) => variant.id === selectedVariantId);
  const structuredSelectedVariant = hasStructuredVariants && product.variants ? product.variants.find(v => 
    (!selectedSize || v.options?.["Kích thước"] === selectedSize) && 
    (!selectedColor || v.options?.["Màu sắc"] === selectedColor)
  ) : null;

  const activeVariant = hasStructuredVariants ? structuredSelectedVariant : flatSelectedVariant;
  const stock = activeVariant?.stock ?? product.stock;
  const price = Number(activeVariant?.price ?? product.salePrice ?? product.price);
  const inStock = stock > 0;

  const selectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const selectColor = (color: { name: string; images?: string[] }) => {
    if (selectedColor === color.name) {
      setSelectedColor(null);
      window.dispatchEvent(new CustomEvent("productImageSelect", { detail: { urls: null } }));
    } else {
      setSelectedColor(color.name);
      setQuantity(1);
      window.dispatchEvent(new CustomEvent("productImageSelect", { detail: { urls: color.images?.length ? color.images : null } }));
    }
  };

  return (
    <div className="grid gap-5">
      {hasStructuredVariants && structuredData ? (
        <div className="space-y-5">
          {structuredData.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Màu sắc: <span className="text-muted-foreground ml-1">{selectedColor}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {structuredData.colors.map(color => {
                  const isSelected = color.name === selectedColor;
                  // check if there's any stock for this color (across any size)
                  const hasStock = product.variants?.some(v => v.options?.["Màu sắc"] === color.name && v.stock > 0);
                  
                  return (
                    <button
                      key={color.name}
                      onClick={() => selectColor(color)}
                      className={cn(
                        "relative flex items-center justify-center rounded-full transition-all border-2",
                        isSelected ? "border-primary scale-110 shadow-sm" : "border-transparent hover:scale-105",
                        !hasStock && "opacity-50 grayscale"
                      )}
                      title={color.name}
                    >
                      <div 
                        className="w-8 h-8 rounded-full border border-border shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md mix-blend-difference" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {structuredData.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Kích thước
                </h3>
                <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                  <Ruler className="size-3" />
                  Bảng kích thước
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {structuredData.sizes.map(size => {
                  const isSelected = size === selectedSize;
                  // Check stock for this specific size + currently selected color
                  const variant = product.variants?.find(v => 
                    v.options?.["Kích thước"] === size && 
                    (!selectedColor || v.options?.["Màu sắc"] === selectedColor)
                  );
                  const isAvailable = variant ? variant.stock > 0 : false;

                  return (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setQuantity(1); }}
                      disabled={!isAvailable && isSelected === false}
                      className={cn(
                        "rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-all hover:border-primary",
                        isSelected && "border-primary bg-primary/5 text-primary shadow-sm",
                        !isAvailable && "cursor-not-allowed opacity-40 hover:border-border line-through"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : product.variants?.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Phân loại
            </h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Ruler className="size-3" />
              Bảng kích thước
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
                    variant.stock <= 0 &&
                      "cursor-not-allowed opacity-45 hover:border-border hover:text-foreground line-through",
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

      {activeVariant ? (
        <div className="rounded-lg bg-muted/60 p-4 border border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá phân loại</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatPrice(price)}
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Số lượng
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Còn {stock} sản phẩm
          </p>
        </div>
        <QuantitySelector
          max={stock || 1}
          value={quantity}
          onChange={setQuantity}
        />
      </div>
      <Button
        className="h-12 rounded-lg bg-primary text-base"
        disabled={!inStock}
        onClick={async () => {
          try {
            await addItem(product, quantity, activeVariant?.id);
            toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Không thể thêm vào giỏ hàng",
            );
          }
        }}
      >
        <ShoppingBag className="size-5" />
        {inStock ? "Thêm vào giỏ hàng" : "Hết hàng"}
      </Button>
      <Button
        variant="outline"
        className="h-12 rounded-lg bg-background text-base"
        onClick={() => toast.success("Da tao phien mua nhanh")}
      >
        <Zap className="size-5" />
        Mua ngay
      </Button>
      <WishlistButton
        productId={product.id}
        className="h-11 rounded-lg bg-background"
      />
    </div>
  );
}
