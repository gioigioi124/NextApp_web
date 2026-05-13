import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from "lucide-react";

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-surface h-screen border-r border-border hidden md:flex flex-col sticky top-0">
      <div className="h-20 flex items-center px-6 border-b border-border">
        <h1 className="font-heading text-xl font-bold text-primary tracking-tight">LUMINA ADMIN</h1>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Quản lý
        </div>
        
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-surface-variant hover:text-foreground transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Tổng quan</span>
        </Link>
        
        <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors">
          <Package className="w-5 h-5" />
          <span className="font-medium">Sản phẩm</span>
        </Link>

        <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-surface-variant hover:text-foreground transition-colors">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">Đơn hàng</span>
        </Link>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4 px-2">
          Hệ thống
        </div>

        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-surface-variant hover:text-foreground transition-colors">
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
