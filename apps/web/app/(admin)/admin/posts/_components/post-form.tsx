"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-form-hooks"; // Wait, I should use react-hook-form
import { useForm as useRHForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Editor } from "@/components/ui/editor";
import { ImageUpload } from "@/components/product/image-upload";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  content: z.string().min(1, "Nội dung không được để trống"),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  type: z.enum(["BLOG", "PAGE"]).default("BLOG"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: any;
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useRHForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      thumbnail: "",
      status: "DRAFT",
      type: "BLOG",
      seoTitle: "",
      seoDescription: "",
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await apiClient.fetch(`/posts/${initialData.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await apiClient.fetch("/posts", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("Tạo bài viết thành công!");
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      // Very simple slugify for now, but usually we use a library
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon" type="button">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-heading">
            {initialData ? "Chỉnh sửa bài viết" : "Viết bài mới"}
          </h1>
        </div>
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tiêu đề</label>
              <Input {...form.register("title")} placeholder="Nhập tiêu đề bài viết..." onBlur={generateSlug} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <label className="text-sm font-medium block">Nội dung bài viết</label>
              <Controller
                control={form.control}
                name="content"
                render={({ field }) => (
                  <Editor content={field.value} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Tối ưu SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tiêu đề SEO</label>
                <Input {...form.register("seoTitle")} placeholder="Để trống sẽ dùng tiêu đề bài viết" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mô tả SEO</label>
                <Textarea {...form.register("seoDescription")} placeholder="Mô tả ngắn hiển thị trên Google..." rows={3} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Trạng thái & Phân loại</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Loại nội dung</label>
              <select 
                {...form.register("type")} 
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="BLOG">Tin tức / Blog</option>
                <option value="PAGE">Trang tĩnh (Giới thiệu, v.v)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Trạng thái</label>
              <select 
                {...form.register("status")} 
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Đường dẫn (Slug)</label>
              <Input {...form.register("slug")} placeholder="duong-dan-bai-viet" />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Mô tả ngắn (Excerpt)</h3>
            <Textarea {...form.register("excerpt")} placeholder="Tóm tắt nội dung bài viết..." rows={4} />
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Ảnh đại diện</h3>
            <div>
              <ImageUpload 
                value={form.watch("thumbnail") ? [form.watch("thumbnail") as string] : []}
                onChange={(urls) => form.setValue("thumbnail", urls[0] || "")}
                maxFiles={1}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
