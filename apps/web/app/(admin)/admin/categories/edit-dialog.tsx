"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "shared-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Loader2 } from "lucide-react";
import { Category } from "./columns";
import { getClientAuthHeaders } from "@/lib/auth-headers";

interface EditCategoryDialogProps {
  category: Category;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({ category, categories, open, onOpenChange }: EditCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || null,
    }
  });

  // Quan trọng: Reset form mỗi khi category hoặc trạng thái open thay đổi
  useEffect(() => {
    if (open) {
      reset({
        name: category.name,
        description: category.description || "",
        parentId: category.parentId || null,
      });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Đã cập nhật danh mục");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Lỗi khi cập nhật danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the current category from the parent selection to avoid circular reference
  const availableParents = categories.filter(c => c.id !== category.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Chỉnh Sửa Danh Mục</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho danh mục "{category.name}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên danh mục</Label>
            <Input id="name" {...register("name")} placeholder="Ví dụ: Chăn ga gối" className="bg-muted/50 border-border h-11" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danh mục cha (Tùy chọn)</Label>
            <Select 
              defaultValue={category.parentId || "none"} 
              onValueChange={(val) => setValue("parentId", val === "none" ? null : String(val))}
            >
              <SelectTrigger className="bg-muted/50 border-border h-11">
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                {availableParents.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mô tả</Label>
            <Textarea id="description" {...register("description")} placeholder="Nhập mô tả ngắn..." className="bg-muted/50 border-border min-h-[100px] resize-none" />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
              Cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
