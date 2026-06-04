import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getPromotions() {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/promotions`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Fetch promotions error:", error);
    return [];
  }
}

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hệ thống Khuyến mãi</h1>
          <p className="text-muted-foreground mt-1">Quản lý các chương trình giảm giá và khuyến mãi</p>
        </div>
        <Link 
          href="/admin/promotions/new" 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo khuyến mãi
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Tên chương trình</th>
                <th className="px-6 py-4 font-medium">Loại giảm giá</th>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Chưa có chương trình khuyến mãi nào.
                  </td>
                </tr>
              ) : (
                promotions.map((promo: any) => (
                  <tr key={promo.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{promo.name}</div>
                      {promo.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{promo.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {promo.discountType === 'PERCENTAGE' 
                        ? <Badge variant="secondary">Giảm {Number(promo.discountValue)}%</Badge>
                        : <Badge variant="outline">Giảm {Number(promo.discountValue).toLocaleString('vi-VN')}đ</Badge>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(promo.startDate), "dd/MM/yyyy", { locale: vi })} - {format(new Date(promo.endDate), "dd/MM/yyyy", { locale: vi })}
                    </td>
                    <td className="px-6 py-4">
                      {promo.isActive ? (
                        new Date(promo.endDate) < new Date() ? (
                          <Badge variant="destructive">Đã kết thúc</Badge>
                        ) : new Date(promo.startDate) > new Date() ? (
                          <Badge variant="outline">Sắp diễn ra</Badge>
                        ) : (
                          <Badge variant="success">Đang diễn ra</Badge>
                        )
                      ) : (
                        <Badge variant="secondary">Tạm ngưng</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        href={`/admin/promotions/${promo.id}`}
                        className="inline-flex p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
