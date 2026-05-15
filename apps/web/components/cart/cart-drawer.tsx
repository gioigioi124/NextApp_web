"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "shared-utils";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <Sheet open={isOpen} onOpenChange={(nextOpen) => (nextOpen ? openCart() : closeCart())}>
      <SheetContent side="right" className="w-[92vw] max-w-md gap-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Gio hang ({totalItems})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <p className="mt-4 font-semibold text-foreground">Gio hang dang trong</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Chon san pham yeu thich de bat dau don hang.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Tiep tuc mua hang
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-border p-2">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="aspect-square overflow-hidden rounded-md bg-muted"
                    onClick={closeCart}
                  >
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
                          onClick={closeCart}
                        >
                          {item.product.name}
                        </Link>
                        {item.variant ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.variant.name}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Xoa san pham"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex h-8 items-center rounded-md border border-border">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-full rounded-r-none"
                          aria-label="Giam so luong"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-full rounded-l-none"
                          aria-label="Tang so luong"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <SheetFooter className="border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tam tinh</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeCart}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold hover:bg-muted"
            >
              Xem gio hang
            </Link>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Thanh toan
            </Link>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
