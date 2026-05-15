import type { Product } from "@/types/storefront";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image?: string | null;
  stock: number;
};

export type CartVariant = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
  options?: Record<string, string>;
};

export type CartItem = {
  id: string;
  product: CartProduct;
  variant?: CartVariant | null;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Cart = {
  id: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

export type WishlistItem = {
  id: string;
  addedAt: string;
  product: Product;
};

export type Wishlist = {
  id: string | null;
  items: WishlistItem[];
  productIds: string[];
  totalItems: number;
};
