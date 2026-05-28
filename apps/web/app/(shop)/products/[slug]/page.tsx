import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews } from "@/components/product/product-reviews";
import { RatingStars } from "@/components/product/rating-stars";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getProductBySlug, getProducts } from "@/services/catalog.service";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatPrice } from "shared-utils";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function getAttributes(attributes: unknown) {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) return [];

  return Object.entries(attributes as Record<string, unknown>).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      robots: { index: false, follow: false },
    };
  }

  const image = product.images?.[0]?.url || siteConfig.ogImage;
  const title = product.name;
  const description = product.description || siteConfig.description;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/products/${product.slug}`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/products/${product.slug}`),
      siteName: siteConfig.name,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getProducts({
    category: product.category?.slug,
    limit: "4",
  });
  let images = product.images?.length ? [...product.images] : [];
  
  if ((product.variants?.length ?? 0) > 0) {
    const allVariantImages: string[] = [];
    (product.variants || []).forEach((v: any) => {
      if (v.options?.images && Array.isArray(v.options.images)) {
        allVariantImages.push(...v.options.images);
      } else if (v.image) {
        allVariantImages.push(v.image);
      }
    });
    
    const uniqueVariantImages = Array.from(new Set(allVariantImages)).filter(Boolean);
    
    uniqueVariantImages.forEach((url, idx) => {
      if (!images.find(img => img.url === url)) {
        images.push({
          id: `variant-img-${idx}`,
          url: url as string,
          alt: `${product.name} variant`,
          position: images.length
        } as any);
      }
    });
  }

  const mainImage = images[0]?.url;
  const currentPrice = Number(product.salePrice || product.price);
  const originalPrice = Number(product.price);
  const discount = product.salePrice
    ? Math.round(((originalPrice - Number(product.salePrice)) / originalPrice) * 100)
    : 0;
  const attributes = getAttributes(product.attributes);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight className="size-4" />
        <Link href="/products" className="hover:text-primary">Sản phẩm</Link>
        {product.category ? (
          <>
            <ChevronRight className="size-4" />
            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        ) : null}
        <ChevronRight className="size-4" />
        <span className="font-bold text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
        {/* Left Column: Image Gallery */}
        <ProductGallery images={images} productName={product.name} />

        {/* Right Column: Sticky Info Panel */}
        <div className="md:col-span-5 lg:sticky lg:top-28">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h1 className="mb-2 font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl">
              {product.name}
            </h1>
            
            <div className="mb-6 flex items-center gap-4">
              <RatingStars value={product.averageRating || 0} />
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0} đánh giá)</span>
              <div className="mx-1 h-4 w-[1px] bg-border"></div>
              {product.stock > 0 ? (
                <span className="text-sm font-medium text-emerald-600">Còn hàng</span>
              ) : (
                <span className="text-sm font-medium text-destructive">Hết hàng</span>
              )}
            </div>

            <div className="mb-8 flex items-baseline gap-4">
              <span className="text-3xl font-semibold text-accent">{formatPrice(currentPrice)}</span>
              {product.salePrice ? (
                <>
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                  <span className="rounded bg-accent/10 px-2 py-1 text-xs font-bold tracking-wider text-accent">-{discount}%</span>
                </>
              ) : null}
            </div>

            {/* Options */}
            <div className="mb-8">
              <ProductDetailActions product={product} />
            </div>

            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Truck className="size-5 text-secondary" />
                <span className="text-sm font-medium">Giao hàng toàn quốc trong 2-4 ngày</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className="size-5 text-secondary" />
                <span className="text-sm font-medium">Bảo hành 1 đổi 1 trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <section className="mt-16 md:mt-20">
        <Tabs defaultValue="description">
          <TabsList className="hide-scrollbar mb-8 flex w-full justify-start gap-8 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger 
              value="description" 
              className="rounded-none border-transparent bg-transparent px-0 pb-4 font-heading text-xl font-semibold text-muted-foreground hover:bg-transparent hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Mô tả sản phẩm
            </TabsTrigger>
            <TabsTrigger 
              value="specs" 
              className="rounded-none border-transparent bg-transparent px-0 pb-4 font-heading text-xl font-semibold text-muted-foreground hover:bg-transparent hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Thông số kỹ thuật
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-transparent bg-transparent px-0 pb-4 font-heading text-xl font-semibold text-muted-foreground hover:bg-transparent hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Đánh giá ({product.reviewCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="max-w-4xl space-y-6 leading-relaxed text-muted-foreground">
            {product.description}
            {/* Extended Static Description Mockup from HTML if needed */}
            <div className="my-10 grid gap-8 md:grid-cols-2">
              <div className="relative min-h-72 overflow-hidden rounded-xl shadow-md">
                <OptimizedImage
                  className="h-full w-full object-cover"
                  alt="Quality detail"
                  src={mainImage || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h4 className="font-heading text-xl font-semibold text-primary">Ưu điểm vượt trội</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                    <span>100% tự nhiên cao cấp, thân thiện với làn da.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                    <span>Thoáng khí tối ưu, phù hợp cho cả 4 mùa tại Việt Nam.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                    <span>Độ bền màu cao, không xù lông hay co rút sau nhiều lần giặt.</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="grid max-w-4xl gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</p>
                <p className="mt-1 font-semibold text-foreground">{product.category?.name || "Lumina"}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tồn kho</p>
                <p className="mt-1 font-semibold text-foreground">{product.stock} sản phẩm</p>
              </div>
              {attributes.map((attribute) => (
                <div key={attribute.key} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{attribute.key}</p>
                  <p className="mt-1 font-semibold text-foreground">{attribute.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <ProductReviews
              productId={product.id}
              averageRating={product.averageRating || 0}
              reviewCount={product.reviewCount || 0}
              initialReviews={product.reviews || []}
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Products */}
      {related.data.length > 0 && (
        <section className="mt-16 md:mt-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-3xl font-semibold text-primary">Sản phẩm tương tự</h2>
            <Link href="/products" className="flex items-center gap-1 font-bold text-secondary hover:underline">
              Xem tất cả <ChevronRight className="size-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.data
              .filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
