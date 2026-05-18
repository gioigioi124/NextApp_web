import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/types/order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Cho xac nhan",
  CONFIRMED: "Da xac nhan",
  PROCESSING: "Dang xu ly",
  SHIPPING: "Dang giao",
  DELIVERED: "Da giao",
  CANCELLED: "Da huy",
  RETURNED: "Da hoan",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Chua thanh toan",
  PAID: "Da thanh toan",
  REFUNDED: "Da hoan tien",
};

const orderStatusClassNames: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  PROCESSING: "border-indigo-200 bg-indigo-50 text-indigo-700",
  SHIPPING: "border-blue-200 bg-blue-50 text-blue-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
  RETURNED: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

const paymentStatusClassNames: Record<PaymentStatus, string> = {
  UNPAID: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REFUNDED: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={orderStatusClassNames[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={paymentStatusClassNames[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
