"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addCartItem,
  clearServerCart,
  fetchCart,
  removeCartItem,
  syncServerCart,
  updateCartItem,
} from "@/services/cart.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Cart, CartItem } from "@/types/cart";
import type { Product } from "@/types/storefront";

type CartState = {
  id: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  isLoading: boolean;
  lastChangedAt: number;
  openCart: () => void;
  closeCart: () => void;
  fetchServerCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
};

const quantityUpdateTimers = new Map<string, ReturnType<typeof setTimeout>>();

const emptyCart: Cart = {
  id: null,
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

function computeTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
}

function normalizeCart(cart: Cart) {
  return {
    id: cart.id,
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    lastChangedAt: Date.now(),
  };
}

function getGuestItemId(productId: string, variantId?: string) {
  return `${productId}:${variantId || "default"}`;
}

function toGuestCartItem(product: Product, quantity: number, variantId?: string): CartItem {
  const variant = product.variants?.find((item) => item.id === variantId);
  const unitPrice = Number(variant?.price ?? product.salePrice ?? product.price);
  const image = variant?.image || product.images?.[0]?.url || null;

  return {
    id: getGuestItemId(product.id, variantId),
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      image,
      stock: variant?.stock ?? product.stock,
    },
    variant: variant
      ? {
          id: variant.id,
          name: variant.name,
          price: Number(variant.price),
          stock: variant.stock,
          image: variant.image,
          options: variant.options,
        }
      : null,
    variantId: variantId || null,
    quantity,
    unitPrice,
    subtotal: unitPrice * quantity,
  };
}

function mergeProductIntoItems(
  currentItems: CartItem[],
  product: Product,
  quantity: number,
  variantId?: string,
) {
  const variant = product.variants?.find((item) => item.id === variantId);
  const stock = variant?.stock ?? product.stock;
  const items = [...currentItems];
  const existingIndex = items.findIndex(
    (item) => item.product.id === product.id && (item.variantId || null) === (variantId || null),
  );

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    const nextQuantity = Math.min(stock, existing.quantity + quantity);
    items[existingIndex] = {
      ...existing,
      quantity: nextQuantity,
      subtotal: nextQuantity * existing.unitPrice,
    };
  } else {
    items.push(toGuestCartItem(product, quantity, variantId));
  }

  return items;
}

function updateItemQuantity(items: CartItem[], itemId: string, quantity: number) {
  return items.map((item) => {
    if (item.id !== itemId) return item;
    const nextQuantity = Math.min(quantity, item.product.stock);
    return {
      ...item,
      quantity: nextQuantity,
      subtotal: nextQuantity * item.unitPrice,
    };
  });
}

function hasAuth() {
  return useAuthStore.getState().isAuthenticated;
}

async function reconcileCart(set: (partial: Partial<CartState>) => void) {
  try {
    const response = await fetchCart();
    set(normalizeCart(response.data));
  } catch {
    // Keep the optimistic cart if the follow-up fetch fails.
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...emptyCart,
      isOpen: false,
      isLoading: false,
      lastChangedAt: 0,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      fetchServerCart: async () => {
        if (!hasAuth()) return;

        set({ isLoading: true });
        try {
          const response = await fetchCart();
          set(normalizeCart(response.data));
        } finally {
          set({ isLoading: false });
        }
      },
      addItem: async (product, quantity = 1, variantId) => {
        const variant = product.variants?.find((item) => item.id === variantId);
        const stock = variant?.stock ?? product.stock;

        if (stock <= 0 || quantity > stock) {
          throw new Error("Sản phẩm đã hết hàng");
        }

        const previous = get();
        const items = mergeProductIntoItems(previous.items, product, quantity, variantId);

        const changedAt = Date.now();

        set({
          id: hasAuth() ? previous.id : null,
          items,
          ...computeTotals(items),
          isOpen: true,
          lastChangedAt: changedAt,
        });

        if (!hasAuth()) return;

        try {
          const response = await addCartItem({ productId: product.id, quantity, variantId });
          if (get().lastChangedAt === changedAt) {
            set({ ...normalizeCart(response.data), isOpen: true });
          }
        } catch (error) {
          if (get().lastChangedAt === changedAt) {
            set({
              id: previous.id,
              items: previous.items,
              totalItems: previous.totalItems,
              totalPrice: previous.totalPrice,
              isOpen: previous.isOpen,
              lastChangedAt: Date.now(),
            });
          }
          throw error;
        }
      },
      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) return;

        const previous = get();
        const items = updateItemQuantity(previous.items, itemId, quantity);

        const changedAt = Date.now();

        set({
          items,
          ...computeTotals(items),
          lastChangedAt: changedAt,
        });

        if (hasAuth() && !itemId.includes(":")) {
          const existingTimer = quantityUpdateTimers.get(itemId);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          quantityUpdateTimers.set(
            itemId,
            setTimeout(async () => {
              quantityUpdateTimers.delete(itemId);
              try {
                const response = await updateCartItem(itemId, quantity);
                if (get().lastChangedAt === changedAt) {
                  set(normalizeCart(response.data));
                }
              } catch {
                await reconcileCart(set);
              }
            }, 250),
          );
        }
      },
      removeItem: async (itemId) => {
        const existingTimer = quantityUpdateTimers.get(itemId);
        if (existingTimer) {
          clearTimeout(existingTimer);
          quantityUpdateTimers.delete(itemId);
        }

        const previous = get();
        const items = previous.items.filter((item) => item.id !== itemId);
        const changedAt = Date.now();

        set({ items, ...computeTotals(items), lastChangedAt: changedAt });

        if (hasAuth() && !itemId.includes(":")) {
          try {
            const response = await removeCartItem(itemId);
            if (get().lastChangedAt === changedAt) {
              set(normalizeCart(response.data));
            }
          } catch (error) {
            if (get().lastChangedAt === changedAt) {
              set({
                items: previous.items,
                totalItems: previous.totalItems,
                totalPrice: previous.totalPrice,
                lastChangedAt: Date.now(),
              });
            }
            throw error;
          }
        }
      },
      clearCart: async () => {
        quantityUpdateTimers.forEach((timer) => clearTimeout(timer));
        quantityUpdateTimers.clear();

        const previous = get();
        const changedAt = Date.now();
        set({ ...emptyCart, isOpen: previous.isOpen, lastChangedAt: changedAt });

        if (hasAuth()) {
          try {
            const response = await clearServerCart();
            if (get().lastChangedAt === changedAt) {
              set(normalizeCart(response.data));
            }
          } catch (error) {
            if (get().lastChangedAt === changedAt) {
              set({
                id: previous.id,
                items: previous.items,
                totalItems: previous.totalItems,
                totalPrice: previous.totalPrice,
                lastChangedAt: Date.now(),
              });
            }
            throw error;
          }
        }
      },
      syncWithServer: async () => {
        if (!hasAuth()) return;

        const guestItems = get()
          .items.filter((item) => item.id.includes(":"))
          .map((item) => ({
            productId: item.product.id,
            variantId: item.variantId,
            quantity: item.quantity,
          }));

        set({ isLoading: true });
        try {
          const response =
            guestItems.length > 0 ? await syncServerCart(guestItems) : await fetchCart();
          set(normalizeCart(response.data));
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        id: state.id,
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    },
  ),
);
