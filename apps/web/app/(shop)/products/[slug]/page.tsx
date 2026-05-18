import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductCard } from "@/components/product/product-card";
import { ProductReviews } from "@/components/product/product-reviews";
import { RatingStars } from "@/components/product/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      title: "San pham khong ton tai",
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
  const images = product.images?.length ? product.images : [];
  const mainImage = images[0]?.url;
  const currentPrice = Number(product.salePrice || product.price);
  const originalPrice = Number(product.price);
  const discount = product.salePrice
    ? Math.round(((originalPrice - Number(product.salePrice)) / originalPrice) * 100)
    : 0;
  const attributes = getAttributes(product.attributes);

  return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Trang chủ</Link>
          <ChevronRight className="size-4" />
          <Link href="/products" className="hover:text-foreground">Sản phẩm</Link>
          {product.category ? (
            <>
              <ChevronRight className="size-4" />
              <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
                {product.category.name}
              </Link>
            </>
          ) : null}
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="group aspect-square overflow-hidden rounded-lg border border-border bg-muted shadow-sm md:aspect-[5/4]">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={images[0]?.alt || product.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((image, index) => (
                <div key={`${image.url}-${index}`} className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm lg:sticky lg:top-32">
            <div className="flex flex-wrap gap-2">
              {product.category ? (
                <Badge variant="secondary" className="rounded-full">{product.category.name}</Badge>
              ) : null}
              {discount > 0 ? (
                <Badge className="rounded-full bg-accent text-white">-{discount}%</Badge>
              ) : null}
            </div>
            <h1 className="[font-family:var(--font-heading)] mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RatingStars value={product.averageRating || 0} />
              <span className="text-sm font-medium text-foreground">{(product.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0} đánh giá)</span>
              <span className="text-sm text-muted-foreground">SKU: {product.sku || product.id}</span>
            </div>

            <div className="mt-6 rounded-lg bg-muted p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">{formatPrice(currentPrice)}</span>
                {product.salePrice ? (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Hoặc 3 kỳ từ {formatPrice(Math.ceil(currentPrice / 3))} với ví điện tử hỗ trợ.
              </p>
            </div>

            <p className="mt-5 leading-7 text-muted-foreground">{product.description}</p>

            <div className="mt-6">
              <ProductDetailActions product={product} />
            </div>

            <Separator className="my-6" />
            <div className="grid gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Truck className="size-4 text-secondary" /> Giao hàng nhanh toàn quốc</span>
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-secondary" /> Kiểm tra chất lượng trước khi đóng gói</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-secondary" /> Đổi trả nếu sản phẩm lỗi sản xuất</span>
            </div>
          </aside>
        </section>

        <section className="mt-12 rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
          <Tabs defaultValue="description">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="specs">Thông số</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="max-w-3xl leading-7 text-muted-foreground">
              {product.description}
            </TabsContent>
            <TabsContent value="specs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Danh mục</p>
                  <p className="font-semibold text-foreground">{product.category?.name || "Lumina"}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Tồn kho</p>
                  <p className="font-semibold text-foreground">{product.stock} sản phẩm</p>
                </div>
                {attributes.map((attribute) => (
                  <div key={attribute.key} className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">{attribute.key}</p>
                    <p className="font-semibold text-foreground">{attribute.value}</p>
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

        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Gợi ý thêm</p>
              <h2 className="[font-family:var(--font-heading)] text-3xl font-semibold text-foreground">Sản phẩm tương tự</h2>
            </div>
          </div>
          <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.data
              .filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
          </div>
        </section>
      </main>
  );
}
