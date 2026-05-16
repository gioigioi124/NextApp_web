"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchOrder } from "@/services/checkout.service";
import type { Order } from "@/types/order";
import { formatPrice } from "shared-utils";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder(params.id)
      .then((response) => setOrder(response.data))
      .catch(() => router.push("/profile"))
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-5 h-10" render={<Link href="/profile" />}>
        <ArrowLeft className="mr-2 size-4" />
        Tai khoan
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">Don hang</p>
          <h1 className="text-3xl font-semibold text-foreground">{order.orderNumber}</h1>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-sm font-semibold">
          {order.status}
        </span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <PackageCheck className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">San pham</h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Giao hang</h2>
          <div className="mt-3 text-sm">
            <p className="font-medium">{order.address.fullName}</p>
            <p className="mt-1 text-muted-foreground">{order.address.phone}</p>
            <p className="mt-1">
              {order.address.street}, {order.address.ward}, {order.address.district},{" "}
              {order.address.city}
            </p>
          </div>
          <Separator className="my-5" />
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
          <Separator className="my-5" />
          <div className="flex justify-between font-semibold">
            <span>Tong cong</span>
            <span className="text-xl">{formatPrice(order.total)}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
