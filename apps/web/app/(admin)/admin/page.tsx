"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Loader2,
  PackageCheck,
  ReceiptText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/order-status";
import { fetchDashboardOverview } from "@/services/admin.service";
import type { DashboardOverview, Metric } from "@/types/admin";
import { formatPrice } from "shared-utils";

function formatMetric(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function MetricCard({
  title,
  metric,
  icon: Icon,
  currency = false,
}: {
  title: string;
  metric: Metric;
  icon: React.ComponentType<{ className?: string }>;
  currency?: boolean;
}) {
  const change = metric.change;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className="size-5 text-primary" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-foreground">
          {currency ? formatPrice(metric.value) : formatMetric(metric.value)}
        </p>
        {change !== null ? (
          <Badge
            variant={change >= 0 ? "secondary" : "destructive"}
            className="h-6 rounded-md"
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchDashboardOverview()
      .then((response) => {
        if (isMounted) setOverview(response.data);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load dashboard");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const maxRevenue = useMemo(() => {
    return Math.max(...(overview?.salesSeries.map((row) => row.revenue) || [0]), 1);
  }, [overview]);

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="mx-auto max-w-7xl rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Khong tai duoc du lieu dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Quản trị</span>
            <span>/</span>
            <span className="font-medium text-primary">Tổng quan</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Theo doi doanh thu, đơn hàng, khach hang va ton kho can xu ly.
          </p>
        </div>
        <Button variant="outline" className="h-10" render={<Link href="/admin/orders" />}>
          Đơn hàng
          <ArrowUpRight className="size-4" />
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Doanh thu 30 ngay"
          metric={overview.metrics.revenue}
          icon={CircleDollarSign}
          currency
        />
        <MetricCard title="Đơn hàng 30 ngay" metric={overview.metrics.orders} icon={ReceiptText} />
        <MetricCard title="Khach moi" metric={overview.metrics.customers} icon={Users} />
        <MetricCard
          title="Giá tri trung binh"
          metric={overview.metrics.averageOrderValue}
          icon={PackageCheck}
          currency
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-foreground">Can xu ly</h2>
              <p className="mt-1 text-sm text-muted-foreground">Trạng thái van hanh hien tai</p>
            </div>
            <AlertTriangle className="size-5 text-amber-600" />
          </div>
          <div className="mt-5 divide-y divide-border">
            <Link
              href="/admin/orders?status=PENDING"
              className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-primary"
            >
              <p className="text-sm text-muted-foreground">Don cho xac nhan</p>
              <p className="text-2xl font-semibold">{overview.metrics.pendingOrders}</p>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-primary"
            >
              <p className="text-sm text-muted-foreground">Sản phẩm sap het</p>
              <p className="text-2xl font-semibold">{overview.metrics.lowStockCount}</p>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-foreground">Doanh thu 7 ngay</h2>
              <p className="mt-1 text-sm text-muted-foreground">Cot cao nhat tuong ung ngay tot nhat</p>
            </div>
            <Boxes className="size-5 text-primary" />
          </div>
          <div className="mt-5 flex h-48 items-end gap-3">
            {overview.salesSeries.map((row) => (
              <div key={row.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-md bg-muted">
                  <div
                    className="w-full rounded-md bg-secondary transition-all"
                    style={{ height: `${Math.max((row.revenue / maxRevenue) * 100, 4)}%` }}
                    title={formatPrice(row.revenue)}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Đơn hàng moi</h2>
            <Button variant="ghost" className="h-8" render={<Link href="/admin/orders" />}>
              Xem tất cả
            </Button>
          </div>
          <div className="divide-y divide-border">
            {overview.recentOrders.length ? (
              overview.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-3 p-4 transition-colors hover:bg-muted/60 md:grid-cols-[1fr_160px_120px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{order.orderNumber}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.user.name} - {order.itemCount} sản phẩm
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-left font-semibold text-foreground md:text-right">
                    {formatPrice(order.total)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">Chưa có đơn hàng.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Sản phẩm bán chạy</h2>
          </div>
          <div className="divide-y divide-border">
            {overview.topProducts.length ? (
              overview.topProducts.map((product) => (
                <div key={product.productId} className="flex items-center gap-3 p-4">
                  <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{product.sku || "No SKU"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.quantitySold}</p>
                    <p className="text-xs text-muted-foreground">da ban</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">Chưa có du lieu ban hang.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">Can nhap hang</h2>
        </div>
        <div className="divide-y divide-border">
          {overview.lowStockProducts.length ? (
            overview.lowStockProducts.map((product) => (
              <div key={product.id} className="grid gap-3 p-4 md:grid-cols-[1fr_120px_120px] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                </div>
                <Badge variant={product.stock <= 3 ? "destructive" : "outline"} className="h-6 rounded-md">
                  Ton {product.stock}
                </Badge>
                <Button variant="outline" className="h-8" render={<Link href={`/admin/products/${product.id}/edit`} />}>
                  Cập nhật
                </Button>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Không có sản phẩm sap het hang.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
