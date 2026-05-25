"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Copy, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  status: string;
  category: { name: string } | null;
  images: any[];
  isActive: boolean;
  variants?: any[];
};

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

import { clearCacheByTag } from "@/app/actions";

const ProductActions = ({ product }: { product: Product }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.fetch(`/products/${product.id}`, {
        method: "DELETE",
      });
      
      toast.success("Đã xóa sản phẩm thành công!");
      await clearCacheByTag("products");
      await clearCacheByTag("categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa sản phẩm.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Copy className="w-4 h-4 mr-2" /> Nhân bản
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Xóa sản phẩm
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn sản phẩm <strong>{product.name}</strong> và các biến thể liên quan. Bạn không thể hoàn tác hành động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
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
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "SẢN PHẨM",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{product.name}</div>
            <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "variants",
    header: "BIẾN THỂ",
    cell: ({ row }) => {
      const variants = row.original.variants;
      if (!variants || variants.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      const keys = new Set<string>();
      variants.forEach(v => {
        if (v.options) {
          Object.keys(v.options).forEach(k => keys.add(k));
        }
      });
      const attrNames = Array.from(keys).join(", ");

      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{variants.length} phân loại</span>
          {attrNames && <span className="text-xs text-muted-foreground">{attrNames}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "DANH MỤC",
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{row.original.category?.name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">GIÁ BÁN</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);

      return <div className="text-right font-semibold text-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-center">TỒN KHO</div>,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <div className="text-center">
          <Badge variant={stock > 10 ? "default" : stock > 0 ? "secondary" : "destructive"} className="px-2.5 py-1">
            {stock}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "TRẠNG THÁI",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className="flex items-center gap-1.5 text-sm">
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          <span className={isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isActive ? "Đang bán" : "Ngừng bán"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductActions product={row.original} />,
  },
];
