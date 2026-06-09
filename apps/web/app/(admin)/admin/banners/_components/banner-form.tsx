"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { ImageUpload } from "@/components/product/image-upload";

const bannerSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, "Vui lòng chọn ảnh"),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  position: z.string(),
  isActive: z.boolean(),
  order: z.coerce.number(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  initialData?: any;
}

export function BannerForm({ initialData }: BannerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: initialData || {
      title: "",
      subtitle: "",
      description: "",
      image: "",
      link: "",
      buttonText: "Khám phá ngay",
      position: "HERO",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = async (data: BannerFormValues) => {
    try {
      setIsLoading(true);
      
      if (initialData) {
        await apiClient.fetch(`/banners/${initialData.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast.success("Cập nhật banner thành công");
      } else {
        await apiClient.fetch("/banners", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("Tạo banner thành công");
      }
      
      router.push("/admin/banners");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/banners"
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? "Chỉnh sửa Banner" : "Tạo Banner mới"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Nội dung</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề chính *</label>
              <input 
                {...form.register("title")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Ví dụ: Giấc ngủ ngon bắt đầu từ những điều nhỏ nhẹ..."
              />
              {form.formState.errors.title && <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề phụ (Subtitle)</label>
              <input 
                {...form.register("subtitle")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Ví dụ: Bộ sưu tập mùa hè 2026..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả ngắn</label>
              <textarea 
                {...form.register("description")} 
                className="w-full bg-input border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring transition-all min-h-[100px] resize-y"
                placeholder="Mô tả về chương trình..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Đường dẫn khi click (Link)</label>
                <input 
                  {...form.register("link")} 
                  className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="/products hoặc /categories/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chữ trên nút bấm</label>
                <input 
                  {...form.register("buttonText")} 
                  className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Ví dụ: Khám phá ngay"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Hình ảnh</h3>
            <div className="space-y-2">
              <ImageUpload
                value={form.watch("image") ? [form.watch("image")] : []}
                onChange={(urls) => {
                  if (urls.length > 0) {
                    form.setValue("image", urls[0], { shouldValidate: true });
                  } else {
                    form.setValue("image", "", { shouldValidate: true });
                  }
                }}
                maxFiles={1}
              />
              {form.formState.errors.image && <p className="text-destructive text-sm">{form.formState.errors.image.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Cấu hình</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vị trí hiển thị</label>
              <select 
                {...form.register("position")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="HERO">Slider Đầu Trang (Hero)</option>
                <option value="PROMOTIONAL">Banner Giữa Trang (Promotional)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <select 
                {...form.register("isActive", {
                  setValueAs: (v) => v === "true" || v === true
                })} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="true">Hiển thị</option>
                <option value="false">Tạm ngưng</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thứ tự hiển thị</label>
              <input 
                type="number"
                {...form.register("order")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Số càng nhỏ, xếp càng cao (0 là đầu tiên).</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
