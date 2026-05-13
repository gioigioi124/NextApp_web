"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info, Layers, Image as ImageIcon, Banknote, CloudUpload } from "lucide-react";
import Link from "next/link";
import { productSchema, ProductInput } from "shared-utils";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "cm3ed", // Placeholder for now
      status: "active",
    }
  });

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        throw new Error("Lỗi khi thêm sản phẩm");
      }
      
      toast.success("Đã thêm sản phẩm thành công!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <header className="flex items-center justify-between mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">Thêm sản phẩm mới</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button variant="outline" type="button">Hủy</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-card p-6 rounded-xl border border-border space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Thông tin cơ bản</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">TÊN SẢN PHẨM</Label>
                  <Input id="name" {...register("name")} placeholder="Ví dụ: Bộ Ga Lụa Satin" className="bg-input h-12" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase">MÔ TẢ CHI TIẾT</Label>
                  <Textarea id="description" {...register("description")} placeholder="Mô tả chất liệu, đặc tính..." className="bg-input min-h-[150px] resize-none" />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Biến thể sản phẩm</h2>
                </div>
                <Button variant="secondary" size="sm" type="button">Thêm thuộc tính</Button>
              </div>
              <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                Chưa có thuộc tính nào được thêm. (Kích thước, Màu sắc...)
              </div>
            </section>
          </div>

          {/* Cột phải */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-card p-6 rounded-xl border border-border space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Hình ảnh</h2>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <CloudUpload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Kéo thả hoặc nhấn để tải lên</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG (Tối đa 5MB)</p>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Giá & Kho</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">GIÁ BÁN GỐC</Label>
                  <div className="relative">
                    <Input type="number" {...register("price")} className="bg-input h-12 pr-12 text-primary font-bold" placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₫</span>
                  </div>
                  {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">TỔNG TỒN KHO</Label>
                  <Input type="number" {...register("stock")} className="bg-input h-12" placeholder="0" />
                  {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">TRẠNG THÁI</Label>
                  <Select defaultValue="active" onValueChange={(v) => setValue('status', v as "active" | "draft" | "out")}>
                    <SelectTrigger className="h-12 bg-input">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang kinh doanh</SelectItem>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="out">Hết hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
