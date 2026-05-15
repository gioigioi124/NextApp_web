import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columns, Product } from "./columns";
import { ProductFilters } from "./product-filters";
import { Pagination } from "@/components/ui/pagination";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getProducts(params: { page?: string; search?: string; categoryId?: string }): Promise<{ data: Product[], meta: any }> {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/products?${query}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error("Fetch products error:", error);
    return { data: [], meta: { total: 0, page: 1, totalPages: 0 } };
  }
}

export default async function AdminProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; search?: string; categoryId?: string }> 
}) {
  const params = await searchParams;
  const { data, meta } = await getProducts(params);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <span>Quản trị</span>
            <span>/</span>
            <span className="text-primary font-medium">Danh sách sản phẩm</span>
          </nav>
          <h2 className="font-heading text-3xl font-bold text-foreground">Quản lý Sản phẩm</h2>
          <p className="text-muted-foreground mt-2">Cập nhật và theo dõi kho hàng Lumina của bạn một cách dễ dàng.</p>
        </div>
        <Link href="/admin/products/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm sản phẩm mới
          </Button>
        </Link>
      </div>

      <ProductFilters />

      <div className="space-y-4">
        <DataTable columns={columns} data={data} />
        <Pagination totalPages={meta.totalPages} currentPage={meta.page} />
      </div>
    </div>
  );
}
