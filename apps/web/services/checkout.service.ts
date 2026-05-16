"use client";

import { apiClient } from "@/lib/api-client";
import type { Address, CouponValidation, Order } from "@/types/order";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type AddressInput = Omit<Address, "id">;

export async function fetchAddresses() {
  return apiClient.fetch<ApiResponse<Address[]>>("/users/me/addresses");
}

export async function createAddress(input: AddressInput) {
  return apiClient.fetch<ApiResponse<Address>>("/users/me/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function validateCoupon(code: string, subtotal: number) {
  return apiClient.fetch<ApiResponse<CouponValidation>>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function createOrder(input: {
  addressId: string;
  paymentMethod: "COD" | "CARD";
  couponCode?: string;
  note?: string;
}) {
  return apiClient.fetch<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchOrder(orderId: string) {
  return apiClient.fetch<ApiResponse<Order>>(`/orders/${orderId}`);
}
