"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuantitySelectorProps = {
  max?: number;
  value?: number;
  onChange?: (quantity: number) => void;
};

export function QuantitySelector({ max = 99, value, onChange }: QuantitySelectorProps) {
  const [internalQuantity, setInternalQuantity] = useState(1);
  const quantity = value ?? internalQuantity;

  const updateQuantity = (nextQuantity: number) => {
    const normalized = Math.max(1, Math.min(max, nextQuantity));
    onChange?.(normalized);
    if (value === undefined) {
      setInternalQuantity(normalized);
    }
  };

  return (
    <div className="flex h-11 w-36 items-center rounded-lg border border-border bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Giảm số lượng"
        className="h-full flex-1 rounded-r-none"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={quantity <= 1}
      >
        <Minus className="size-4" />
      </Button>
      <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Tăng số lượng"
        className="h-full flex-1 rounded-l-none"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={quantity >= max}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
