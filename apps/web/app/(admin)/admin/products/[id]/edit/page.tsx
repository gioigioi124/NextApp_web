"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info, Layers, Image as ImageIcon, Banknote, CloudUpload, Trash2, Plus, Loader2, Wand2, Palette } from "lucide-react";
import Link from "next/link";
import { productSchema, ProductInput } from "shared-utils";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import { ImageUpload } from "@/components/product/image-upload";
import { apiClient } from "@/lib/api-client";
import { clearCacheByTag } from "@/app/actions";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justLoadedRef = useRef(false);
  
  // State for specific attributes
  const [sizes, setSizes] = useState<{ name: string; price: number; stock: number; sku: string }[]>([]);
  const [colors, setColors] = useState<{ name: string; hex: string; images: string[] }[]>([]);

  const [variants, setVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const variantsRef = useRef<any[]>([]);
  const categoryItems = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
  const statusItems = [
    { value: "active", label: "Đang kinh doanh" },
    { value: "draft", label: "Nháp" },
    { value: "out", label: "Hết hàng" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const json = await apiClient.fetch<any>(`/categories`);
        setCategories(json.data || []);
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
      categoryId: "",
      status: "active",
      attributes: [],
      variants: []
    }
  });

  const basePrice = watch("price");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const json = await apiClient.fetch<any>(`/products/${id}`);
        const product = json.data;

        const loadedSizes: any[] = [];
        const loadedColors: any[] = [];
        const loadedVariants = product.variants || [];

        const sizeNames = new Set<string>();
        const colorNames = new Set<string>();
        
        loadedVariants.forEach((v: any) => {
          const sName = v.options?.["Kích thước"];
          const cName = v.options?.["Màu sắc"];
          if (sName && !sizeNames.has(sName)) {
            sizeNames.add(sName);
            loadedSizes.push({ name: sName, price: Number(v.price), stock: 0, sku: v.sku?.split('-').slice(0,-1).join('-') || '' });
          }
          if (cName && !colorNames.has(cName)) {
            colorNames.add(cName);
            loadedColors.push({ name: cName, hex: v.options?.colorCode || '#ccc', images: Array.isArray(v.options?.images) ? v.options.images : (v.image ? [v.image] : []) });
          }
        });

        const loadedAttributes: any[] = [];
        if (loadedSizes.length > 0) {
          loadedAttributes.push({ name: "Kích thước", values: loadedSizes.map(s => s.name) });
        }
        if (loadedColors.length > 0) {
          loadedAttributes.push({ name: "Màu sắc", values: loadedColors.map(c => c.name) });
        }

        reset({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          categoryId: product.categoryId || "",
          status: product.isActive ? 'active' : 'draft',
          sku: product.sku,
          images: product.images?.map((img: any) => img.url) || [],
          attributes: loadedAttributes.length > 0 ? loadedAttributes : (product.attributes || []),
          variants: product.variants?.map((v: any) => ({...v, price: Number(v.price), stock: Number(v.stock)})) || [],
        });

        if (loadedSizes.length === 0 && loadedColors.length === 0 && loadedVariants.length === 0) {
          // No structured variants
        } else {
          setSizes(loadedSizes);
          setColors(loadedColors);
          updateVariants(loadedVariants.map((v:any) => ({...v, price: Number(v.price), stock: Number(v.stock)})));
        }
        
        justLoadedRef.current = true;
      } catch (error) {
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, reset]);

  // Generate Cartesian Product of Sizes and Colors
  useEffect(() => {
    if (isLoading) return;
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    const activeSizes = sizes.filter(s => s.name.trim() !== "");
    const activeColors = colors.filter(c => c.name.trim() !== "");

    if (activeSizes.length === 0 && activeColors.length === 0) {
      if (variantsRef.current.length > 0) {
        updateVariants([]);
        setValue("variants", []);
      }
      setValue("attributes", []);
      return;
    }

    const newVariants: any[] = [];
    const generateSku = (suffix: string) => `SKU-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*1000)}-${suffix}`.replace(/--+/g, '-').replace(/-$/, '');

    if (activeSizes.length > 0 && activeColors.length > 0) {
      activeSizes.forEach(size => {
        activeColors.forEach(color => {
          const name = `${size.name} - ${color.name}`;
          const existing = variantsRef.current.find(v => v.name === name);
          const defaultSku = size.sku ? `${size.sku}-${color.name.replace(/\s+/g, '-').toUpperCase()}` : generateSku(color.name.replace(/\s+/g, '-').toUpperCase());
          newVariants.push({
            name,
            options: { "Kích thước": size.name, "Màu sắc": color.name, colorCode: color.hex, images: color.images },
            price: existing?.price || size.price || basePrice || 0,
            stock: existing?.stock || size.stock || 0,
            sku: existing?.sku || defaultSku,
            image: color.images?.[0] || ""
          });
        });
      });
    } else if (activeSizes.length > 0) {
      activeSizes.forEach(size => {
        const name = size.name;
        const existing = variantsRef.current.find(v => v.name === name);
        newVariants.push({
          name,
          options: { "Kích thước": size.name },
          price: existing?.price || size.price || basePrice || 0,
          stock: existing?.stock || size.stock || 0,
          sku: existing?.sku || size.sku || generateSku(size.name.replace(/\s+/g, '-').toUpperCase()),
          image: ""
        });
      });
    } else if (activeColors.length > 0) {
      activeColors.forEach(color => {
        const name = color.name;
        const existing = variantsRef.current.find(v => v.name === name);
        newVariants.push({
          name,
          options: { "Màu sắc": color.name, colorCode: color.hex, images: color.images },
          price: existing?.price || basePrice || 0,
          stock: existing?.stock || 0,
          sku: existing?.sku || generateSku(color.name.replace(/\s+/g, '-').toUpperCase()),
          image: color.images?.[0] || ""
        });
      });
    }

    const prevNames = JSON.stringify(variantsRef.current.map(v => v.name));
    const nextNames = JSON.stringify(newVariants.map(v => v.name));

    if (prevNames !== nextNames) {
      updateVariants(newVariants);
      setValue("variants", newVariants);
    } else {
      let changed = false;
      const updatedVariants = variantsRef.current.map(v => {
        const sizeInfo = activeSizes.find(s => v.options["Kích thước"] === s.name);
        const colorInfo = activeColors.find(c => v.options["Màu sắc"] === c.name);
        
        let newPrice = v.price;
        let newImage = v.image;
        let newColorCode = v.options.colorCode;
        let newImages = v.options.images;

        if (sizeInfo && v.price !== sizeInfo.price) {
          newPrice = sizeInfo.price;
          changed = true;
        }
        if (colorInfo && (v.image !== colorInfo.images?.[0] || v.options.colorCode !== colorInfo.hex || JSON.stringify(v.options.images) !== JSON.stringify(colorInfo.images))) {
          newImage = colorInfo.images?.[0] || "";
          newColorCode = colorInfo.hex;
          newImages = colorInfo.images;
          changed = true;
        }

        if (changed) {
          return { ...v, price: newPrice, image: newImage, options: { ...v.options, colorCode: newColorCode, images: newImages } };
        }
        return v;
      });

      if (changed) {
        updateVariants(updatedVariants);
        setValue("variants", updatedVariants);
      }
    }

    const newAttributes = [];
    if (activeSizes.length > 0) {
      newAttributes.push({ name: "Kích thước", values: activeSizes.map(s => s.name) });
    }
    if (activeColors.length > 0) {
      newAttributes.push({ name: "Màu sắc", values: activeColors.map(c => c.name) });
    }
    setValue("attributes", newAttributes);
  }, [sizes, colors, basePrice, setValue]);

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...variantsRef.current];
    newVariants[index] = { ...newVariants[index], [field]: value };
    updateVariants(newVariants);
    setValue("variants", newVariants);
  };

  const STANDARD_SIZES = ["100x190", "120x190", "150x190", "160x200", "180x200", "200x220"];

  const addStandardSizes = () => {
    const currentSizeNames = sizes.map(s => s.name);
    const missingSizes = STANDARD_SIZES.filter(s => !currentSizeNames.includes(s));
    if (missingSizes.length > 0) {
      setSizes([...sizes, ...missingSizes.map(name => ({ name, price: basePrice || 0, stock: 0, sku: "" }))]);
    }
  };

  const addSize = () => setSizes([...sizes, { name: "", price: basePrice || 0, stock: 0, sku: "" }]);
  const updateSize = (idx: number, field: string, value: any) => {
    const newSizes = [...sizes];
    newSizes[idx] = { ...newSizes[idx], [field]: value };
    setSizes(newSizes);
  };
  const removeSize = (idx: number) => setSizes(sizes.filter((_, i) => i !== idx));

  const addColor = () => setColors([...colors, { name: "", hex: "#000000", images: [] }]);
  const updateColor = (idx: number, field: string, value: any) => {
    const newColors = [...colors];
    newColors[idx] = { ...newColors[idx], [field]: value };
    setColors(newColors);
  };
  const removeColor = (idx: number) => setColors(colors.filter((_, i) => i !== idx));

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);
    try {
      await apiClient.fetch(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          // attributes are already set in form data via setValue
          variants: variants.map((v, i) => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock),
            sku: v.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}-${i}`
          }))
        })
      });
      
      toast.success("Đã cập nhật sản phẩm thành công!");
      await clearCacheByTag("products");
      await clearCacheByTag("categories");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
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
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
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
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(v) => setValue("categoryId", v ? String(v) : "", { shouldValidate: true })}
                    >
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
                  <h2 className="text-xl font-bold text-foreground">Kích thước & Giá</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={addStandardSizes}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Thêm bộ kích thước chuẩn
                  </Button>
                  <Button variant="secondary" size="sm" type="button" onClick={addSize}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm kích thước
                  </Button>
                </div>
              </div>

              {sizes.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                  Chưa có kích thước nào. Nhấn "Thêm bộ kích thước chuẩn" để bắt đầu nhanh.
                </div>
              ) : (
                <div className="space-y-4">
                  {sizes.map((size, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Kích thước</Label>
                        <Input 
                          placeholder="VD: 160x200" 
                          value={size.name}
                          onChange={(e) => updateSize(idx, 'name', e.target.value)}
                          className="bg-card h-10" 
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Giá tiền (₫)</Label>
                        <Input 
                          type="number"
                          value={size.price}
                          onChange={(e) => updateSize(idx, 'price', Number(e.target.value))}
                          className="bg-card h-10" 
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Tồn kho</Label>
                        <Input 
                          type="number"
                          value={size.stock}
                          onChange={(e) => updateSize(idx, 'stock', Number(e.target.value))}
                          className="bg-card h-10" 
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Mã SKU</Label>
                        <Input 
                          placeholder="SKU kích thước"
                          value={size.sku}
                          onChange={(e) => updateSize(idx, 'sku', e.target.value)}
                          className="bg-card h-10" 
                        />
                      </div>
                      <Button variant="ghost" size="icon" type="button" className="mt-6 text-destructive hover:bg-destructive/10" onClick={() => removeSize(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-card p-6 rounded-xl border border-border space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Màu sắc & Hình ảnh</h2>
                </div>
                <Button variant="secondary" size="sm" type="button" onClick={addColor}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm màu sắc
                </Button>
              </div>

              {colors.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                  Chưa có màu sắc nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {colors.map((color, idx) => (
                    <div key={idx} className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex gap-4 items-start w-full">
                        <div className="space-y-2 flex-1">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Tên màu</Label>
                          <Input 
                            placeholder="VD: Đỏ, Xanh dương..." 
                            value={color.name}
                            onChange={(e) => updateColor(idx, 'name', e.target.value)}
                            className="bg-card h-10" 
                          />
                        </div>
                        <div className="space-y-2 w-24">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase text-center block">Mã màu</Label>
                          <div className="relative w-full h-10 rounded-md overflow-hidden border border-border">
                            <input 
                              type="color" 
                              value={color.hex}
                              onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                            />
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" type="button" className="mt-6 text-destructive hover:bg-destructive/10" onClick={() => removeColor(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 w-full">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Tổ hợp hình ảnh (Màu này)</Label>
                        <ImageUpload 
                          value={color.images || []}
                          onChange={(urls) => updateColor(idx, 'images', urls)}
                          maxFiles={5}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {variants.length > 0 && (
              <section className="bg-card p-6 rounded-xl border border-border space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Danh sách Biến thể (Tự động)</h2>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border mb-4">
                  Danh sách này được tạo tự động dựa trên Kích thước và Màu sắc bạn đã nhập.
                  Bạn có thể chỉnh sửa lại Tồn kho hoặc SKU cho từng biến thể cụ thể nếu cần.
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Biến thể</th>
                        <th className="px-4 py-3 w-32">Ảnh</th>
                        <th className="px-4 py-3">Giá (₫)</th>
                        <th className="px-4 py-3">Tồn kho</th>
                        <th className="px-4 py-3">SKU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {variants.map((variant, idx) => (
                        <tr key={idx} className="bg-card hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              {variant.options?.colorCode && (
                                <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: variant.options.colorCode }}></span>
                              )}
                              {variant.name}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-8 h-8 rounded border border-border overflow-hidden bg-muted flex items-center justify-center">
                              {variant.image ? (
                                <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {/* Read-only price since it's strictly from size */}
                            <span className="font-semibold">{Number(variant.price).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Input type="number" className="h-8" value={variant.stock} onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))} />
                          </td>
                          <td className="px-4 py-3">
                            <Input className="h-8" value={variant.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
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
                <h2 className="text-xl font-bold text-foreground">
                  {variants.length > 0 ? "Giá tham chiếu" : "Giá & Kho"}
                </h2>
              </div>

              {variants.length > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/60 border border-border rounded-lg px-3 py-2">
                  ⚡ Sản phẩm có biến thể — giá và tồn kho thực tế được quản lý riêng theo từng biến thể bên trái.
                  Giá dưới dùng làm giá mặc định cho biến thể mới sinh ra.
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    {variants.length > 0 ? "GIÁ MẶC ĐọNH BIẾN THỂ" : "GIÁ BÁN GỐC"}
                  </Label>
                  <div className="relative">
                    <Input type="number" {...register("price")} className="bg-input h-12 pr-12 text-primary font-bold" placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₫</span>
                  </div>
                  {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                </div>

                {variants.length === 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">TỔNG TỒN KHO</Label>
                    <Input type="number" {...register("stock")} className="bg-input h-12" placeholder="0" />
                    {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">TRẠNG THÁI</Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(v) => setValue('status', v as "active" | "draft" | "out")}
                  >
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
        )}
      </form>
    </div>
  );
}
