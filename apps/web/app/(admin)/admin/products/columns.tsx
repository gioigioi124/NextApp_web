"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
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
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "SẢN PHẨM",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {/* Using div as placeholder for image */}
            <div className="w-full h-full bg-slate-200" />
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
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer text-primary">
              <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-secondary">
              <Copy className="w-4 h-4 mr-2" /> Nhân bản
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Xóa sản phẩm
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
