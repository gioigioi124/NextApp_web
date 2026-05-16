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

const wishlistSyncTimers = new Map<string, ReturnType<typeof setTimeout>>();
const wishlistSyncChains = new Map<string, Promise<void>>();

function normalizeWishlist(wishlist: Wishlist) {
  return {
    id: wishlist.id,
    items: wishlist.items,
    productIds: wishlist.productIds,
    totalItems: wishlist.totalItems,
  };
}

let wishlistOperationId = 0;

function syncWishlistProduct(productId: string, shouldBeWishlisted: boolean) {
  const existingTimer = wishlistSyncTimers.get(productId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  wishlistSyncTimers.set(
    productId,
    setTimeout(() => {
      wishlistSyncTimers.delete(productId);

      const previousSync = wishlistSyncChains.get(productId) ?? Promise.resolve();
      const nextSync = previousSync
        .catch(() => undefined)
        .then(async () => {
          if (shouldBeWishlisted) {
            await addWishlistProduct(productId);
          } else {
            await removeWishlistProduct(productId);
          }
        })
        .catch(() => {
          // Keep the fast optimistic UI; the next fetch will reconcile server state.
        })
        .finally(() => {
          if (wishlistSyncChains.get(productId) === nextSync) {
            wishlistSyncChains.delete(productId);
          }
        });

      wishlistSyncChains.set(productId, nextSync);
    }, 250),
  );
}

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
    wishlistOperationId += 1;
    const previous = get();
    const isWishlisted = previous.productIds.includes(productId);
    const nextWishlisted = !isWishlisted;
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

    syncWishlistProduct(productId, nextWishlisted);

    return nextWishlisted;
  },
  removeProduct: async (productId) => {
    wishlistOperationId += 1;
    const previous = get();
    const productIds = previous.productIds.filter((id) => id !== productId);
    const items = previous.items.filter((item) => item.product.id !== productId);

    set({
      productIds,
      items,
      totalItems: productIds.length,
    });

    syncWishlistProduct(productId, false);
  },
  isWishlisted: (productId) => get().productIds.includes(productId),
}));
