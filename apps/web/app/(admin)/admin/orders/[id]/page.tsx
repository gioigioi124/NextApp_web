"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, PackageCheck, ReceiptText, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
  PAYMENT_STATUS_LABELS,
  PaymentStatusBadge,
} from "@/components/order/order-status";
import { OrderTimeline } from "@/components/order/order-timeline";
import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "@/services/order.service";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { formatPrice } from "shared-utils";

const paymentStatuses: PaymentStatus[] = ["UNPAID", "PAID", "REFUNDED"];
const allowedStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

function getStatusOptions(status: OrderStatus) {
  return [status, ...allowedStatusTransitions[status]].filter(
    (item, index, items) => items.indexOf(item) === index,
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAdminOrder(params.id)
      .then((response) => setOrder(response.data))
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load order");
        router.push("/admin/orders");
      })
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const response = await updateAdminOrderStatus(order.id, status);
      setOrder(response.data);
      toast.success("Da cap nhat trang thai don hang");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const changePaymentStatus = async (paymentStatus: PaymentStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const response = await updateAdminPaymentStatus(order.id, paymentStatus);
      setOrder(response.data);
      toast.success("Da cap nhat thanh toan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update payment");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button variant="ghost" className="h-10" render={<Link href="/admin/orders" />}>
        <ArrowLeft className="mr-2 size-4" />
        Don hang
      </Button>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">Chi tiet don hang</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tao luc {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <OrderTimeline status={order.status} />

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <PackageCheck className="size-5 text-primary" />
              <h2 className="font-semibold text-foreground">San pham</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
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

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5 text-primary" />
              <h2 className="font-semibold text-foreground">Ghi chu</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {order.note || "Khach hang khong de lai ghi chu."}
            </p>
          </div>
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Cap nhat xu ly</h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Trang thai don hang</span>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  value={order.status}
                  disabled={isUpdating}
                  onChange={(event) => changeStatus(event.target.value as OrderStatus)}
                >
                  {getStatusOptions(order.status).map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Thanh toan</span>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  value={order.paymentStatus}
                  disabled={isUpdating}
                  onChange={(event) => changePaymentStatus(event.target.value as PaymentStatus)}
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {PAYMENT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
              {isUpdating ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Dang cap nhat
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              <h2 className="font-semibold text-foreground">Giao hang</h2>
            </div>
            <div className="mt-3 text-sm">
              <p className="font-medium">{order.address.fullName}</p>
              <p className="mt-1 text-muted-foreground">{order.address.phone}</p>
              <p className="mt-1">
                {order.address.street}, {order.address.ward}, {order.address.district},{" "}
                {order.address.city}
              </p>
            </div>
            <Separator className="my-5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{order.user?.name}</p>
              <p className="mt-1 text-muted-foreground">{order.user?.email}</p>
              {order.user?.phone ? (
                <p className="mt-1 text-muted-foreground">{order.user.phone}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Thanh tien</h2>
            <div className="mt-4 grid gap-2 text-sm">
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
          </div>
        </aside>
      </section>
    </div>
  );
}
