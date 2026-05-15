"use client";

import { apiClient } from "@/lib/api-client";
import type { Cart, Wishlist } from "@/types/cart";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export async function fetchCart() {
  return apiClient.fetch<ApiResponse<Cart>>("/cart");
}

export async function addCartItem(input: {
  productId: string;
  quantity: number;
  variantId?: string;
}) {
  return apiClient.fetch<ApiResponse<Cart>>("/cart/items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCartItem(itemId: string, quantity: number) {
  return apiClient.fetch<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: string) {
  return apiClient.fetch<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearServerCart() {
  return apiClient.fetch<ApiResponse<Cart>>("/cart", {
    method: "DELETE",
  });
}

export async function syncServerCart(
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>,
) {
  return apiClient.fetch<ApiResponse<Cart>>("/cart/sync", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function fetchWishlist() {
  return apiClient.fetch<ApiResponse<Wishlist>>("/wishlist");
}

export async function addWishlistProduct(productId: string) {
  return apiClient.fetch<ApiResponse<Wishlist>>(`/wishlist/${productId}`, {
    method: "POST",
  });
}

export async function removeWishlistProduct(productId: string) {
  return apiClient.fetch<ApiResponse<Wishlist>>(`/wishlist/${productId}`, {
    method: "DELETE",
  });
}
