"use client";

import { apiClient } from "@/lib/api-client";
import type { Order, OrderStatus, PaginatedOrders, PaymentStatus } from "@/types/order";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

type AdminOrderQuery = {
  page?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
};

function toQueryString(query: AdminOrderQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function fetchOrders() {
  return apiClient.fetch<ApiResponse<Order[]>>("/orders");
}

export async function cancelOrder(orderId: string) {
  return apiClient.fetch<ApiResponse<Order>>(`/orders/${orderId}/cancel`, {
    method: "POST",
  });
}

export async function fetchAdminOrders(query: AdminOrderQuery = {}) {
  return apiClient.fetch<PaginatedOrders>(`/admin/orders${toQueryString(query)}`);
}

export async function fetchAdminOrder(orderId: string) {
  return apiClient.fetch<ApiResponse<Order>>(`/admin/orders/${orderId}`);
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  return apiClient.fetch<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateAdminPaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  return apiClient.fetch<ApiResponse<Order>>(`/admin/orders/${orderId}/payment-status`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}
