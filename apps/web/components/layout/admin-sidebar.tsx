"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  User,
  Users,
  FileText,
  Gift,
  ImageIcon,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin" },
  { icon: Package, label: "Sản phẩm", href: "/admin/products" },
  { icon: Layers, label: "Danh mục", href: "/admin/categories" },
  { icon: FileText, label: "Bài viết / Trang", href: "/admin/posts" },
  { icon: ImageIcon, label: "Banner / Slider", href: "/admin/banners" },
  { icon: Gift, label: "Khuyến mãi", href: "/admin/promotions" },
  { icon: ShoppingCart, label: "Đơn hàng", href: "/admin/orders" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await apiClient.fetch("/auth/logout", { method: "POST" });
    } catch {
      // Local logout still needs to happen if the token is already invalid.
    }

    logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-20 items-center border-b border-border px-6">
        <h1 className="font-heading text-xl font-bold tracking-tight text-primary">LUMINA ADMIN</h1>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quản lý
        </div>

        {menuItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "bg-primary/10 font-semibold text-primary shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

        <div className="mb-4 mt-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Hệ thống
        </div>

        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
            pathname === "/admin/settings" && "bg-primary/10 font-semibold text-primary",
          )}
        >
          <Settings className="size-5" />
          <span className="font-medium">Cài đặt</span>
        </Link>
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
            pathname === "/profile" && "bg-primary/10 font-semibold text-primary",
          )}
        >
          <User className="size-5" />
          <span className="font-medium">Hồ sơ cá nhân</span>
        </Link>
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">Giao diện</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
