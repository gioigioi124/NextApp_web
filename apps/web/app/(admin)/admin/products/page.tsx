import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download } from "lucide-react";
import { DataTable } from "./data-table";
import { columns, Product } from "./columns";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/products`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Fetch products error:", error);
    return [];
  }
}

export default async function AdminProductsPage() {
  const data = await getProducts();

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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              placeholder="Tìm kiếm tên sản phẩm..." 
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-card border border-border rounded-lg px-4 py-2.5 text-foreground outline-none">
              <option value="">Tất cả danh mục</option>
              <option value="chan">Chăn</option>
              <option value="ga">Ga giường</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-4 flex justify-end items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
