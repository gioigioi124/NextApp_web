import { Check, Circle, PackageCheck, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "./order-status";

const activeFlow: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED" || status === "RETURNED") {
    const Icon = status === "CANCELLED" ? XCircle : RotateCcw;

    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground">Tien trinh đơn hàng</h2>
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted p-4">
          <Icon className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">{ORDER_STATUS_LABELS[status]}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Đơn hàng da ket thuc va khong con trong luong giao hang dang xu ly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = activeFlow.indexOf(status);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">Tien trinh đơn hàng</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-5">
        {activeFlow.map((item, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = isDone ? Check : isCurrent ? PackageCheck : Circle;

          return (
            <div key={item} className="relative flex gap-3 sm:block">
              {index < activeFlow.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-3 top-8 h-[calc(100%-16px)] w-px bg-border sm:left-[calc(50%+16px)] sm:top-3 sm:h-px sm:w-[calc(100%-32px)]",
                    isDone && "bg-primary",
                  )}
                />
              ) : null}
              <div
                className={cn(
                  "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background sm:mx-auto",
                  (isDone || isCurrent) && "border-primary bg-primary text-primary-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="pb-3 sm:mt-3 sm:pb-0 sm:text-center">
                <p className={cn("text-sm font-medium text-muted-foreground", isCurrent && "text-foreground")}>
                  {ORDER_STATUS_LABELS[item]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
