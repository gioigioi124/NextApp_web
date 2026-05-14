"use client";

import { useState } from "react";
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
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { Category } from "./columns";

interface CreateCategoryDialogProps {
  categories: Category[];
}

export function CreateCategoryDialog({ categories }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
    }
  });

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Đã thêm danh mục mới");
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error("Lỗi khi thêm danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Thêm Danh Mục Mới</DialogTitle>
          <DialogDescription>
            Tạo danh mục để phân loại sản phẩm của bạn dễ dàng hơn.
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
            <Select onValueChange={(val) => setValue("parentId", val === "none" ? null : String(val))}>
              <SelectTrigger className="bg-muted/50 border-border h-11">
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                {categories.map((cat) => (
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
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Lưu danh mục
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
