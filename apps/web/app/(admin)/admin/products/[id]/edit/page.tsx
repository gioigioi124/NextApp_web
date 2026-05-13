"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info, Layers, Image as ImageIcon, Banknote, CloudUpload, Trash2, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { productSchema, ProductInput } from "shared-utils";
import { toast } from "sonner";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for dynamic attributes
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  // Use ref to read variants inside effects without adding it to dependency array
  const variantsRef = useRef<any[]>([]);

  const updateVariants = (newVal: any[]) => {
    variantsRef.current = newVal;
    setVariants(newVal);
  };

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "cm3ed",
      status: "active",
      attributes: [],
      variants: []
    }
  });

  const basePrice = watch("price");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const product = json.data;

        // Reconstruct attributes from variants options
        let reconstructedAttrs: { name: string; values: string[] }[] = [];
        if (product.variants && product.variants.length > 0) {
          const keys = new Set<string>();
          product.variants.forEach((v: any) => {
            if (v.options) {
              Object.keys(v.options).forEach(k => keys.add(k));
            }
          });
          
          reconstructedAttrs = Array.from(keys).map(key => {
            const valuesSet = new Set<string>();
            product.variants.forEach((v: any) => {
              if (v.options && v.options[key]) {
                valuesSet.add(v.options[key]);
              }
            });
            return { name: key, values: Array.from(valuesSet) };
          });
        }

        setAttributes(reconstructedAttrs);
        variantsRef.current = product.variants || [];
        setVariants(product.variants || []);

        reset({
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          categoryId: product.categoryId,
          status: product.isActive ? "active" : "draft",
          attributes: reconstructedAttrs,
          variants: product.variants || []
        });

      } catch (error) {
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, reset]);

  // Generate Cartesian Product of all attributes (no `variants` in deps → no loop)
  useEffect(() => {
    if (isLoading) return;

    if (attributes.length === 0) {
      // Only clear if not already empty
      if (variantsRef.current.length > 0) {
        updateVariants([]);
      }
      setValue("attributes", []);
      setValue("variants", []);
      return;
    }

    const generateCombinations = (attrs: typeof attributes) => {
      const result: any[] = [];
      const helper = (arr: any[], i: number) => {
        if (i === attrs.length) { result.push([...arr]); return; }
        for (let j = 0; j < attrs[i].values.length; j++) {
          arr[i] = { name: attrs[i].name, value: attrs[i].values[j] };
          helper(arr, i + 1);
        }
      };
      if (attrs.every(a => a.values.length > 0)) helper([], 0);
      return result;
    };

    const combs = generateCombinations(attributes) || [];
    const currentVariants = variantsRef.current;
    const newVariants = combs.map((comb) => {
      const name = comb.map((c: any) => c.value).join(" - ");
      const options = comb.reduce((acc: any, curr: any) => { acc[curr.name] = curr.value; return acc; }, {});
      const existing = currentVariants.find(v => v.name === name);
      return {
        name,
        options,
        price: existing?.price ?? basePrice ?? 0,
        stock: existing?.stock ?? 0,
        sku: existing?.sku || `SKU-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`
      };
    });

    const prevNames = JSON.stringify(currentVariants.map(v => v.name));
    const nextNames = JSON.stringify(newVariants.map(v => v.name));
    if (prevNames !== nextNames) {
      updateVariants(newVariants);
    }
    setValue("attributes", attributes);
    setValue("variants", newVariants.length > 0 ? newVariants : currentVariants);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes, basePrice, isLoading, setValue]);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", values: [] }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttrs = [...attributes];
    newAttrs.splice(index, 1);
    setAttributes(newAttrs);
  };

  const updateAttributeName = (index: number, name: string) => {
    const newAttrs = [...attributes];
    newAttrs[index].name = name;
    setAttributes(newAttrs);
  };

  const updateAttributeValues = (index: number, valuesStr: string) => {
    const newAttrs = [...attributes];
    newAttrs[index].values = valuesStr.split(",").map(v => v.trim()).filter(v => v !== "");
    setAttributes(newAttrs);
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...variantsRef.current];
    newVariants[index] = { ...newVariants[index], [field]: value };
    updateVariants(newVariants);
    setValue("variants", newVariants);
  };

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        // Ensure variants have numeric price/stock (DB returns strings for Decimal)
        variants: (data.variants || variants).map((v: any) => ({
          name: v.name,
          sku: v.sku,
          price: parseFloat(String(v.price)) || 0,
          stock: parseInt(String(v.stock)) || 0,
          options: v.options || {},
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message || `HTTP ${res.status}`);
      }
      
      toast.success("Đã cập nhật sản phẩm thành công!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(`Lỗi: ${error?.message || "Vui lòng thử lại."}`);
      console.error("[Edit Product Error]", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errs: any) => {
    console.error("[Form Validation Error]", errs);
    toast.error("Dữ liệu chưa hợp lệ, kiểm tra lại form.");
  };

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <header className="flex items-center justify-between mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">Chỉnh sửa sản phẩm</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button variant="outline" type="button">Hủy</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
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
                <Button variant="secondary" size="sm" type="button" onClick={handleAddAttribute}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thuộc tính
                </Button>
              </div>

              {attributes.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                  Chưa có thuộc tính nào được thêm. (Ví dụ: Kích thước, Màu sắc...)
                </div>
              ) : (
                <div className="space-y-4">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Tên thuộc tính</Label>
                        <Input 
                          placeholder="Ví dụ: Kích thước" 
                          value={attr.name}
                          onChange={(e) => updateAttributeName(idx, e.target.value)}
                          className="bg-card h-10" 
                        />
                      </div>
                      <div className="space-y-2 flex-[2]">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Các giá trị (cách nhau bởi dấu phẩy)</Label>
                        <Input 
                          placeholder="Ví dụ: S, M, L" 
                          value={attr.values.join(", ")}
                          onChange={(e) => updateAttributeValues(idx, e.target.value)}
                          className="bg-card h-10" 
                        />
                      </div>
                      <Button variant="ghost" size="icon" type="button" className="mt-6 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveAttribute(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {variants.length > 0 && (
                    <div className="mt-8 border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                          <tr>
                            <th className="px-4 py-3">Biến thể</th>
                            <th className="px-4 py-3">Giá</th>
                            <th className="px-4 py-3">Tồn kho</th>
                            <th className="px-4 py-3">SKU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {variants.map((variant, idx) => (
                            <tr key={idx} className="bg-card hover:bg-muted/30">
                              <td className="px-4 py-3 font-medium text-foreground">{variant.name}</td>
                              <td className="px-4 py-3">
                                <Input type="number" className="h-9" value={variant.price} onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))} />
                              </td>
                              <td className="px-4 py-3">
                                <Input type="number" className="h-9" value={variant.stock} onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))} />
                              </td>
                              <td className="px-4 py-3">
                                <Input className="h-9" value={variant.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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
                <h2 className="text-xl font-bold text-foreground">Giá & Kho (Cơ bản)</h2>
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
                  <Select value={watch("status")} onValueChange={(v) => setValue('status', v as "active" | "draft" | "out")}>
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
