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
import { format } from "date-fns";

const promotionSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0, "Giá trị giảm không hợp lệ"),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  isActive: z.boolean().default(true),
  minOrderValue: z.coerce.number().optional().nullable(),
  minQuantity: z.coerce.number().optional().nullable(),
  appliesToAll: z.boolean().default(true),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  initialData?: any;
}

export function PromotionForm({ initialData }: PromotionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: initialData ? {
      ...initialData,
      startDate: initialData.startDate ? format(new Date(initialData.startDate), "yyyy-MM-dd'T'HH:mm") : "",
      endDate: initialData.endDate ? format(new Date(initialData.endDate), "yyyy-MM-dd'T'HH:mm") : "",
    } : {
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      startDate: "",
      endDate: "",
      isActive: true,
      minOrderValue: null,
      minQuantity: null,
      appliesToAll: true,
    },
  });

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      setIsLoading(true);
      
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      if (initialData) {
        await apiClient.fetch(`/promotions/${initialData.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await apiClient.fetch("/promotions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Tạo khuyến mãi thành công");
      }
      
      router.push("/admin/promotions");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const watchDiscountType = form.watch("discountType");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/promotions"
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
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
            <h3 className="font-semibold text-lg border-b border-border pb-4">Thông tin cơ bản</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên chương trình *</label>
              <input 
                {...form.register("name")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="VD: Siêu Sale Giáng Sinh..."
              />
              {form.formState.errors.name && <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả chi tiết</label>
              <textarea 
                {...form.register("description")} 
                className="w-full bg-input border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring transition-all min-h-[100px] resize-y"
                placeholder="Mô tả về chương trình..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại giảm giá *</label>
                <select 
                  {...form.register("discountType")} 
                  className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <option value="PERCENTAGE">Phần trăm (%)</option>
                  <option value="FIXED">Số tiền cố định (đ)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Giá trị giảm *</label>
                <input 
                  type="number"
                  {...form.register("discountValue")} 
                  className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder={watchDiscountType === 'PERCENTAGE' ? "VD: 10" : "VD: 50000"}
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Điều kiện áp dụng</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá trị đơn hàng tối thiểu (đ)</label>
                <input 
                  type="number"
                  {...form.register("minOrderValue")} 
                  className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Để trống nếu không có"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số lượng sản phẩm tối thiểu</label>
                <input 
                  type="number"
                  {...form.register("minQuantity")} 
                  className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Để trống nếu không có"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <input 
                type="checkbox"
                id="appliesToAll"
                {...form.register("appliesToAll")} 
                className="w-5 h-5 rounded-md accent-primary"
              />
              <label htmlFor="appliesToAll" className="text-sm font-medium select-none cursor-pointer">
                Áp dụng cho tất cả sản phẩm
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Thời gian & Trạng thái</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <select 
                {...form.register("isActive")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="true">Kích hoạt</option>
                <option value="false">Tạm ngưng</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày bắt đầu *</label>
              <input 
                type="datetime-local"
                {...form.register("startDate")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              {form.formState.errors.startDate && <p className="text-destructive text-sm">{form.formState.errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày kết thúc *</label>
              <input 
                type="datetime-local"
                {...form.register("endDate")} 
                className="w-full bg-input border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              {form.formState.errors.endDate && <p className="text-destructive text-sm">{form.formState.errors.endDate.message}</p>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
