"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Layers, Loader2 } from "lucide-react";
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
      return <CategoryActions category={row.original} />;
    },
  },
];

import { useState, useEffect } from "react";
import { EditCategoryDialog } from "./edit-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CategoryActions({ category }: { category: Category }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const router = useRouter();

  // We need all categories for the parent selection in the edit dialog
  useEffect(() => {
    if (showEdit) {
      const fetchAll = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories`);
          if (res.ok) {
            const json = await res.json();
            setAllCategories(json.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch all categories:", error);
        }
      };
      fetchAll();
    }
  }, [showEdit]);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories/${category.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Đã xóa danh mục thành công");
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.message || "Lỗi khi xóa danh mục. Có thể danh mục này đang chứa sản phẩm.");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa danh mục");
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
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
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hành động</div>
            <DropdownMenuItem onClick={() => setShowEdit(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Xóa</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryDialog 
        category={category} 
        categories={allCategories} 
        open={showEdit} 
        onOpenChange={setShowEdit} 
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa danh mục <strong>{category.name}</strong>. 
              Lưu ý: Bạn không thể xóa danh mục nếu nó đang chứa sản phẩm hoặc danh mục con.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

