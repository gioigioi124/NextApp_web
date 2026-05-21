"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Loader2, PackageCheck, ShoppingBag, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/order-status";
import { cancelOrder, fetchOrders } from "@/services/order.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Order, OrderStatus } from "@/types/order";
import { formatPrice } from "shared-utils";

const statusFilters: Array<OrderStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export default function OrdersPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const visibleOrders =
    statusFilter === "ALL" ? orders : orders.filter((order) => order.status === statusFilter);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    fetchOrders()
      .then((response) => setOrders(response.data))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load orders"))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const response = await cancelOrder(orderId);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data : order)),
      );
      toast.success("Đã hủy đơn hàng");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Đăng nhập để xem đơn hàng</h1>
        <Button className="mt-5" render={<Link href="/login" />}>
          Đăng nhập
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">Đơn hàng</p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Theo dõi đơn hàng</h1>
        </div>
        <Button variant="outline" className="h-10" render={<Link href="/products" />}>
          Tiếp tục mua sắm
        </Button>
      </div>

      {orders.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border p-10 text-center">
          <PackageCheck className="mx-auto size-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Chưa có đơn hàng</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Các đơn hàng sau khi thanh toán sẽ xuất hiện tại đây.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map((item) => {
              const active = statusFilter === item;
              const count =
                item === "ALL" ? orders.length : orders.filter((order) => order.status === item).length;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatusFilter(item)}
                  className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  data-active={active}
                >
                  {item === "ALL" ? "Tất cả" : ORDER_STATUS_LABELS[item]} ({count})
                </button>
              );
            })}
          </div>

          {visibleOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Không có đơn hàng trong trạng thái này.
            </div>
          ) : null}

          {visibleOrders.map((order) => (
            <article key={order.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{order.orderNumber}</h2>
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="size-4" />
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{order.items.length} sản phẩm</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  ))}
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium text-foreground">{order.items[0]?.name}</p>
                    <p className="mt-1 text-muted-foreground">
                      Giao đến {order.address.district}, {order.address.city}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === "PENDING" ? (
                    <Button
                      variant="outline"
                      className="h-10 text-destructive hover:text-destructive"
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                    >
                      {cancellingId === order.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 size-4" />
                      )}
                      Hủy đơn
                    </Button>
                  ) : null}
                  <Button className="h-10" render={<Link href={`/orders/${order.id}`} />}>
                    Chi tiết
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
