import type { CartItem } from "@/types/cart";

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

export type CouponValidation = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discount: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  note?: string | null;
  createdAt: string;
  address: Address;
  items: Array<
    Omit<CartItem, "unitPrice" | "product" | "variantId"> & {
      productId: string;
      name: string;
      price: number;
      image?: string | null;
      variant?: Record<string, unknown> | null;
    }
  >;
};
