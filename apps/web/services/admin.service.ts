"use client";

import { apiClient } from "@/lib/api-client";
import type { AdminUser, DashboardOverview, PaginatedAdminUsers } from "@/types/admin";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

type AdminUsersQuery = {
  page?: number;
  search?: string;
  role?: string;
};

type UpdateAdminUserInput = {
  name?: string;
  phone?: string;
  role?: "CUSTOMER" | "ADMIN" | "STAFF";
};

function toQueryString(query: AdminUsersQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function fetchDashboardOverview() {
  return apiClient.fetch<ApiResponse<DashboardOverview>>("/admin/dashboard");
}

export async function fetchAdminUsers(query: AdminUsersQuery = {}) {
  return apiClient.fetch<PaginatedAdminUsers>(`/admin/users${toQueryString(query)}`);
}

export async function updateAdminUser(userId: string, input: UpdateAdminUserInput) {
  return apiClient.fetch<ApiResponse<AdminUser>>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
