import type { OrderStatus, PaymentStatus } from "@/types/order";
import type { User } from "shared-types";

export type Metric = {
  value: number;
  change: number | null;
};

export type DashboardOverview = {
  metrics: {
    revenue: Metric;
    orders: Metric;
    customers: Metric;
    averageOrderValue: Metric;
    pendingOrders: number;
    lowStockCount: number;
  };
  salesSeries: Array<{
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    total: number;
    createdAt: string;
    itemCount: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    slug: string | null;
    sku: string | null;
    image: string | null;
    price: number;
    quantitySold: number;
    orderCount: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    stock: number;
    image: string | null;
  }>;
};

export type AdminUser = User & {
  emailVerified: boolean;
  stats: {
    orderCount: number;
    reviewCount: number;
    addressCount: number;
    totalSpent: number;
  };
};

export type PaginatedAdminUsers = {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
