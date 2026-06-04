import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const dynamic = "force-dynamic";

async function getBanners() {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/banners`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Fetch banners error:", error);
    return [];
  }
}

export default async function AdminBannersPage() {
  const banners = await getBanners();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banner & Slider</h1>
          <p className="text-muted-foreground mt-1">Quản lý hình ảnh và thông điệp nổi bật trên trang chủ</p>
        </div>
        <Link 
          href="/admin/banners/new" 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo banner mới
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium w-24">Hình ảnh</th>
                <th className="px-6 py-4 font-medium">Tiêu đề</th>
                <th className="px-6 py-4 font-medium">Vị trí</th>
                <th className="px-6 py-4 font-medium">Thứ tự</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Chưa có banner nào.
                  </td>
                </tr>
              ) : (
                banners.map((banner: any) => (
                  <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-10 rounded overflow-hidden">
                        <OptimizedImage
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-xs text-muted-foreground mt-0.5">{banner.subtitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{banner.position === 'HERO' ? 'Slider Đầu Trang' : banner.position === 'PROMOTIONAL' ? 'Banner Giữa Trang' : banner.position}</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {banner.order}
                    </td>
                    <td className="px-6 py-4">
                      {banner.isActive ? (
                        <Badge variant="success">Hiển thị</Badge>
                      ) : (
                        <Badge variant="secondary">Đang ẩn</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        href={`/admin/banners/${banner.id}`}
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
