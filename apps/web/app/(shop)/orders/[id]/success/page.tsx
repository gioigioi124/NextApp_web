"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchOrder } from "@/services/checkout.service";
import type { Order } from "@/types/order";
import { formatPrice } from "shared-utils";

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder(params.id)
      .then((response) => setOrder(response.data))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Khong tim thay don hang</h1>
        <Button className="mt-5" render={<Link href="/products" />}>
          Tiep tuc mua sam
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-border bg-card p-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-9 text-primary" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-foreground">Dat hang thanh cong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ma don hang <span className="font-semibold text-foreground">{order.orderNumber}</span>
        </p>

        <div className="mt-6 rounded-lg border border-border text-left">
          <div className="grid gap-1 border-b border-border p-4 text-sm">
            <p className="font-semibold text-foreground">{order.address.fullName}</p>
            <p className="text-muted-foreground">{order.address.phone}</p>
            <p>
              {order.address.street}, {order.address.ward}, {order.address.district},{" "}
              {order.address.city}
            </p>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">So luong: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tam tinh</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Van chuyen</span>
                <span>{order.shippingFee ? formatPrice(order.shippingFee) : "Mien phi"}</span>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-primary">
                  <span>Giam gia</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              ) : null}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between font-semibold">
              <span>Tong cong</span>
              <span className="text-xl">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" className="h-10" render={<Link href="/products" />}>
            Tiep tuc mua sam
          </Button>
          <Button className="h-10" render={<Link href={`/orders/${order.id}`} />}>
            Xem don hang
          </Button>
        </div>
      </section>
    </main>
  );
}
