"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";

type WishlistButtonProps = {
  productId: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
};

export function WishlistButton({
  productId,
  label = "Lưu vao yêu thích",
  className,
  iconOnly = false,
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(productId));
  const toggleProduct = useWishlistStore((state) => state.toggleProduct);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const wasWishlisted = isWishlisted;
    toast.success(wasWishlisted ? "Da xoa khoi wishlist" : "Đã thêm vao wishlist");

    try {
      await toggleProduct(productId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong cap nhat duoc wishlist");
    }
  };

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : "outline"}
      size={iconOnly ? "icon-sm" : "default"}
      aria-label={label}
      className={cn(className)}
      onClick={handleToggle}
    >
      <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
      {iconOnly ? null : label}
    </Button>
  );
}
