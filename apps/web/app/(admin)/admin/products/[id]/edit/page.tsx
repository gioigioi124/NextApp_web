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
import { TagInput } from "@/components/ui/tag-input";
import { ImageUpload } from "@/components/product/image-upload";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  // Use ref to read variants inside effects without adding it to dependency array
  const variantsRef = useRef<any[]>([]);
  // Flag to prevent useEffect from clearing variants right after fetch
  const justLoadedRef = useRef(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories`);
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
      }
    };
    fetchCategories();
  }, []);

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

        // Reconstruct attributes from variant options when not explicitly stored
        let loadedAttributes = product.attributes && product.attributes.length > 0
          ? product.attributes
          : [];

        const loadedVariants = product.variants?.map((v: any) => ({
          ...v,
          price: Number(v.price)
        })) || [];

        // If no attributes stored, reconstruct from variant options keys/values
        if (loadedAttributes.length === 0 && loadedVariants.length > 0) {
          const attrMap: Record<string, Set<string>> = {};
          loadedVariants.forEach((v: any) => {
            if (v.options && typeof v.options === 'object') {
              Object.entries(v.options).forEach(([key, val]: [string, any]) => {
                if (!attrMap[key]) attrMap[key] = new Set();
                attrMap[key].add(String(val));
              });
            }
          });
          loadedAttributes = Object.entries(attrMap).map(([name, valSet]) => ({
            name,
            values: Array.from(valSet)
          }));
        }

        reset({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          categoryId: product.categoryId,
          status: product.isActive ? 'active' : 'draft',
          sku: product.sku,
          images: product.images?.map((img: any) => img.url) || [],
          attributes: loadedAttributes,
          variants: loadedVariants,
        });

        setAttributes(loadedAttributes);
        updateVariants(loadedVariants);
        justLoadedRef.current = true; // Signal: skip next useEffect run

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
    // Skip the first run right after fetching to preserve loaded variants
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    // Filter out attributes that are empty (no name OR no values) to keep UX smooth
    const activeAttrs = attributes.filter(a => a.name.trim() !== "" && a.values.length > 0);

    if (activeAttrs.length === 0) {
      if (variantsRef.current.length > 0) {
        updateVariants([]);
        setValue("variants", []);
      }
      setValue("attributes", attributes);
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
      helper([], 0);
      return result;
    };

    const combs = generateCombinations(activeAttrs) || [];
    const currentVariants = variantsRef.current;
    const newVariants = combs.map((comb) => {
      const name = comb.map((c: any) => c.value).join(" - ");
      const options = comb.reduce((acc: any, curr: any) => { acc[curr.name] = curr.value; return acc; }, {});
      const existing = currentVariants.find(v => v.name === name);
      
      return {
        ...existing, // Giữ lại toàn bộ dữ liệu cũ nếu có (id, image, sku, etc.)
        name,
        options,
        price: existing?.price ?? basePrice ?? 0,
        stock: existing?.stock ?? 0,
        sku: existing?.sku || `SKU-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
        image: existing?.image || null
      };
    });

    const prevNames = JSON.stringify(currentVariants.map(v => v.name));
    const newNames = JSON.stringify(newVariants.map(v => v.name));

    if (newNames !== prevNames) {
      updateVariants(newVariants);
      setValue("variants", newVariants);
    }
    setValue("attributes", attributes);
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

  const updateAttributeValues = (index: number, values: string[]) => {
    const newAttrs = [...attributes];
    newAttrs[index].values = values;
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
        attributes: attributes.filter(a => a.name.trim() !== "" && a.values.length > 0),
        // Ensure variants have numeric price/stock (DB returns strings for Decimal)
        variants: (data.variants || variants).map((v: any) => ({
          name: v.name,
          sku: v.sku,
          price: parseFloat(String(v.price)) || 0,
          stock: parseInt(String(v.stock)) || 0,
          image: v.image,
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-xs font-semibold text-muted-foreground uppercase">MÃ SẢN PHẨM (SKU)</Label>
                    <Input id="sku" {...register("sku")} placeholder="Ví dụ: PROD-001" className="bg-input h-12" />
                    {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">DANH MỤC</Label>
                    <Select value={watch("categoryId")} onValueChange={(v) => setValue('categoryId', v)}>
                      <SelectTrigger className="h-12 bg-input">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                  </div>
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
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Tên thuộc tính (vd: Kích thước)</Label>
                        <Input 
                          placeholder="Ví dụ: Kích thước" 
                          value={attr.name}
                          onChange={(e) => updateAttributeName(idx, e.target.value)}
                          className="bg-card h-10" 
                        />
                      </div>
                      <div className="space-y-2 flex-[2]">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Các giá trị</Label>
                        <TagInput
                          values={attr.values}
                          onChange={(vals) => updateAttributeValues(idx, vals)}
                          placeholder="Nhập giá trị rồi nhấn Enter..."
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
                            <th className="px-4 py-3 w-40">Ảnh</th>
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
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-8 h-8 shrink-0 rounded border border-border bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = async (e: any) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          try {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/upload`, {
                                              method: 'POST',
                                              body: formData
                                            });
                                            if (res.ok) {
                                              const data = await res.json();
                                              handleVariantChange(idx, 'image', data.url);
                                              toast.success("Đã tải ảnh biến thể");
                                            }
                                          } catch (err) {
                                            toast.error("Lỗi khi tải ảnh");
                                          }
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    {variant.image ? (
                                      <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <Input 
                                    className="h-8 text-[10px] min-w-[80px]" 
                                    placeholder="URL ảnh" 
                                    value={variant.image || ""} 
                                    onChange={(e) => handleVariantChange(idx, 'image', e.target.value)} 
                                  />
                                </div>
                              </td>
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
                <h2 className="text-xl font-bold text-foreground">Hình ảnh sản phẩm</h2>
              </div>
              
              <ImageUpload 
                value={watch("images") || []} 
                onChange={(urls) => setValue("images", urls)} 
                maxFiles={10} 
              />
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold text-center">
                Ảnh đầu tiên sẽ là ảnh đại diện
              </p>
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
