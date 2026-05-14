"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  _count?: {
    products: number;
  };
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Tên danh mục",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <Layers className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <div className="font-bold text-foreground">{category.name}</div>
            <div className="text-xs text-muted-foreground">/{category.slug}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Danh mục cha",
    cell: ({ row }) => {
      const parent = row.original.parent;
      return parent ? (
        <Badge variant="secondary">{parent.name}</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
  },
  {
    accessorKey: "products",
    header: "Sản phẩm",
    cell: ({ row }) => {
      const count = row.original._count?.products || 0;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">{count}</Badge>
          <span className="text-xs text-muted-foreground">sản phẩm</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      const router = useRouter();

      const onDelete = async () => {
        if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) return;
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories/${category.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            toast.success("Đã xóa danh mục thành công");
            router.refresh();
          } else {
            throw new Error();
          }
        } catch (error) {
          toast.error("Lỗi khi xóa danh mục");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Hành động</div>
              <DropdownMenuItem onClick={() => toast.info("Tính năng đang phát triển")}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
