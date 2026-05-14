"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin" },
  { icon: Package, label: "Sản phẩm", href: "/admin/products" },
  { icon: Layers, label: "Danh mục", href: "/admin/categories" },
  { icon: ShoppingCart, label: "Đơn hàng", href: "/admin/orders" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card h-screen border-r border-border hidden md:flex flex-col sticky top-0">
      <div className="h-20 flex items-center px-6 border-b border-border">
        <h1 className="font-heading text-xl font-bold text-primary tracking-tight">LUMINA ADMIN</h1>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Quản lý
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/5" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4 px-2">
          Hệ thống
        </div>

        <Link href="/admin/settings" className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
          pathname === "/admin/settings" && "bg-primary/10 text-primary font-semibold"
        )}>
          <Settings className="w-5 h-5" />
          <span className="font-medium">Cài đặt</span>
        </Link>
      </div>

      <div className="p-4 border-t border-border">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
