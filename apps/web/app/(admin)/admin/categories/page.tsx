import { Layers, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../products/data-table";
import { columns, Category } from "./columns";
import { CreateCategoryDialog } from "./create-dialog";

export const dynamic = "force-dynamic";

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/categories`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Fetch categories error:", error);
    return [];
  }
}

export default async function AdminCategoriesPage() {
  const data = await getCategories();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <span>Quản trị</span>
            <span>/</span>
            <span className="text-primary font-medium">Cấu trúc danh mục</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">Quản lý Danh mục</h2>
          </div>
          <p className="text-muted-foreground mt-2 max-w-md">Tổ chức sản phẩm của bạn theo các nhóm ngành hàng để khách hàng dễ dàng tìm kiếm.</p>
        </div>
        <CreateCategoryDialog categories={data} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" 
              placeholder="Tìm kiếm danh mục..." 
              type="text"
            />
          </div>
        </div>
        <div className="md:col-span-4 flex justify-end items-center gap-4">
          <Button variant="outline" size="lg" className="gap-2 rounded-xl h-11">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </Button>
          <Button variant="outline" size="lg" className="gap-2 rounded-xl h-11">
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
