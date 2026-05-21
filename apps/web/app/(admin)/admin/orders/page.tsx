"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, PackageCheck, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
  PAYMENT_STATUS_LABELS,
  PaymentStatusBadge,
} from "@/components/order/order-status";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "@/services/order.service";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { formatPrice } from "shared-utils";

const orderStatuses: Array<OrderStatus | ""> = [
  "",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const paymentStatuses: Array<PaymentStatus | ""> = ["", "UNPAID", "PAID", "REFUNDED"];
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const visibleStats = useMemo(() => {
    return {
      pending: orders.filter((order) => order.status === "PENDING").length,
      shipping: orders.filter((order) => order.status === "SHIPPING").length,
      revenue: orders
        .filter((order) => order.status !== "CANCELLED" && order.status !== "RETURNED")
        .reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      try {
        const response = await fetchAdminOrders({ page, search, status, paymentStatus });
        if (!isMounted) return;
        setOrders(response.data);
        setTotalPages(response.meta.totalPages || 1);
        setTotal(response.meta.total);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load orders");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [page, paymentStatus, search, status]);

  const changeOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await updateAdminOrderStatus(orderId, nextStatus);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data : order)),
      );
      toast.success("Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  const changePaymentStatus = async (orderId: string, nextStatus: PaymentStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await updateAdminPaymentStatus(orderId, nextStatus);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data : order)),
      );
      toast.success("Đã cập nhật thanh toán");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update payment");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Quản trị</span>
            <span>/</span>
            <span className="font-medium text-primary">Đơn hàng</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">Quản lý đơn hàng</h1>
          <p className="mt-2 text-muted-foreground">
            Theo dõi tiến độ, thanh toán và xử lý trạng thái giao hàng.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng <span className="font-semibold text-foreground">{total}</span> đơn hàng
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Chờ xác nhận</span>
            <PackageCheck className="size-5 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{visibleStats.pending}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Đang giao</span>
            <Truck className="size-5 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{visibleStats.shipping}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">Giá trị hiển thị</span>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {formatPrice(visibleStats.revenue)}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              placeholder="Tìm mã đơn, email, tên khách hoặc số điện thoại"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            {orderStatuses.map((item) => (
              <option key={item || "all"} value={item}>
                {item ? ORDER_STATUS_LABELS[item] : "Tất cả trạng thái"}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={paymentStatus}
            onChange={(event) => {
              setPage(1);
              setPaymentStatus(event.target.value);
            }}
          >
            {paymentStatuses.map((item) => (
              <option key={item || "all"} value={item}>
                {item ? PAYMENT_STATUS_LABELS[item] : "Tất cả thanh toán"}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="h-10"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPaymentStatus("");
              setPage(1);
            }}
          >
            Xóa lọc
          </Button>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[1.25fr_1fr_150px_160px_120px] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
            <span>Đơn hàng</span>
            <span>Khách hàng</span>
            <span>Trạng thái</span>
            <span>Thanh toán</span>
            <span className="text-right">Tổng tiền</span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Không có đơn hàng phù hợp.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="grid grid-cols-[1.25fr_1fr_150px_160px_120px] items-center gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="truncate font-semibold text-foreground hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                      {updatingId === order.id ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("vi-VN")} · {order.items.length} sản phẩm
                    </p>
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium text-foreground">
                      {order.user?.name || order.address.fullName}
                    </p>
                    <p className="truncate text-muted-foreground">{order.user?.email || order.address.phone}</p>
                  </div>
                  <div className="grid gap-2">
                    <OrderStatusBadge status={order.status} />
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        changeOrderStatus(order.id, event.target.value as OrderStatus)
                      }
                    >
                      {getStatusOptions(order.status).map((item) => (
                        <option key={item} value={item}>
                          {ORDER_STATUS_LABELS[item]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={order.paymentStatus}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        changePaymentStatus(order.id, event.target.value as PaymentStatus)
                      }
                    >
                      {paymentStatuses
                        .filter((item): item is PaymentStatus => Boolean(item))
                        .map((item) => (
                          <option key={item} value={item}>
                            {PAYMENT_STATUS_LABELS[item]}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatPrice(order.total)}</p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="mt-2"
                      aria-label="Xem chi tiết"
                      render={<Link href={`/admin/orders/${order.id}`} />}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Trang <span className="font-medium text-foreground">{page}</span> / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            className="h-10"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
