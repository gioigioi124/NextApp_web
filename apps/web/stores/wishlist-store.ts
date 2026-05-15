"use client";

import { create } from "zustand";
import {
  addWishlistProduct,
  fetchWishlist,
  removeWishlistProduct,
} from "@/services/cart.service";
import type { Wishlist, WishlistItem } from "@/types/cart";

type WishlistState = {
  id: string | null;
  items: WishlistItem[];
  productIds: string[];
  totalItems: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleProduct: (productId: string) => Promise<boolean>;
  removeProduct: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
};

function normalizeWishlist(wishlist: Wishlist) {
  return {
    id: wishlist.id,
    items: wishlist.items,
    productIds: wishlist.productIds,
    totalItems: wishlist.totalItems,
  };
}

let wishlistOperationId = 0;

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  id: null,
  items: [],
  productIds: [],
  totalItems: 0,
  isLoading: false,
  fetchWishlist: async () => {
    const requestOperationId = wishlistOperationId;
    set({ isLoading: true });
    try {
      const response = await fetchWishlist();
      if (wishlistOperationId === requestOperationId) {
        set(normalizeWishlist(response.data));
      }
    } finally {
      set({ isLoading: false });
    }
  },
  toggleProduct: async (productId) => {
    const operationId = ++wishlistOperationId;
    const previous = get();
    const isWishlisted = get().productIds.includes(productId);
    const productIds = isWishlisted
      ? previous.productIds.filter((id) => id !== productId)
      : [...previous.productIds, productId];
    const items = isWishlisted
      ? previous.items.filter((item) => item.product.id !== productId)
      : previous.items;
    const optimisticTotal = productIds.length;

    set({
      productIds,
      items,
      totalItems: optimisticTotal,
    });

    try {
      const response = isWishlisted
        ? await removeWishlistProduct(productId)
        : await addWishlistProduct(productId);
      if (wishlistOperationId === operationId) {
        set(normalizeWishlist(response.data));
      }
    } catch (error) {
      if (wishlistOperationId === operationId) {
        set({
          id: previous.id,
          items: previous.items,
          productIds: previous.productIds,
          totalItems: previous.totalItems,
        });
      }
      throw error;
    }

    return !isWishlisted;
  },
  removeProduct: async (productId) => {
    const operationId = ++wishlistOperationId;
    const previous = get();
    const productIds = previous.productIds.filter((id) => id !== productId);
    const items = previous.items.filter((item) => item.product.id !== productId);

    set({
      productIds,
      items,
      totalItems: productIds.length,
    });

    try {
      const response = await removeWishlistProduct(productId);
      if (wishlistOperationId === operationId) {
        set(normalizeWishlist(response.data));
      }
    } catch (error) {
      if (wishlistOperationId === operationId) {
        set({
          id: previous.id,
          items: previous.items,
          productIds: previous.productIds,
          totalItems: previous.totalItems,
        });
      }
      throw error;
    }
  },
  isWishlisted: (productId) => get().productIds.includes(productId),
}));
