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

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type OrderUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  note?: string | null;
  createdAt: string;
  updatedAt?: string;
  address: Address;
  user?: OrderUser;
  items: Array<
    Omit<CartItem, "unitPrice" | "product" | "variantId"> & {
      productId: string;
      name: string;
      price: number;
      image?: string | null;
      productSlug?: string | null;
      variant?: Record<string, unknown> | null;
    }
  >;
};

export type PaginatedOrders = {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
