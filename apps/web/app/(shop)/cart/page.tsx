"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "shared-utils";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const shippingFee = totalPrice >= 500000 || totalPrice === 0 ? 0 : 35000;
  const total = totalPrice + shippingFee;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Lumina checkout</p>
          <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold text-foreground sm:text-4xl">
            Giỏ hàng
          </h1>
        </div>
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted"
        >
          Tiếp tục mua hàng
        </Link>
      </div>

      {items.length === 0 ? (
        <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Giỏ hàng đang trống</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Các sản phẩm được thêm vào giỏ se hiển thị tại đây de ban kiểm tra trước khi thanh toán.
          </p>
          <Button className="mt-5">
            <Link href="/products">Xem sản phẩm</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="font-semibold text-foreground">{totalItems} sản phẩm</p>
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Xóa tất cả
              </Button>
            </div>

            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto]">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-base font-semibold text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant ? (
                      <p className="mt-1 text-sm text-muted-foreground">{item.variant.name}</p>
                    ) : null}
                    <p className="mt-2 text-sm font-semibold text-primary">{formatPrice(item.unitPrice)}</p>

                    <div className="mt-4 flex w-fit items-center rounded-md border border-border">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-9 rounded-r-none"
                        aria-label="Giảm số lượng"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-9 rounded-l-none"
                        aria-label="Tăng số lượng"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="font-bold text-foreground">{formatPrice(item.subtotal)}</p>
                    <Button variant="ghost" size="icon-sm" aria-label="Xóa sản phẩm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm lg:sticky lg:top-32">
            <h2 className="text-lg font-semibold text-foreground">Tom tat đơn hàng</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tam tinh</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Van chuyen</span>
                <span className="font-medium">{shippingFee ? formatPrice(shippingFee) : "Mien phi"}</span>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="coupon" className="text-sm font-medium text-foreground">
                Ma giam gia
              </label>
              <div className="mt-2 flex gap-2">
                <Input id="coupon" placeholder="Nhap ma" disabled />
                <Button variant="outline" disabled>
                  Áp dụng
                </Button>
              </div>
            </div>
            <Separator className="my-5" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Tổng cong</span>
              <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Thanh toán
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}
