import Link from "next/link";
import { ArrowRight, Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getCategories, getFeaturedProducts, getProducts } from "@/services/catalog.service";
import { HeroSlider } from "@/components/home/hero-slider";
import { PromotionalBanner } from "@/components/home/promotional-banner";

async function getActiveBanners(position: string) {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/banners?position=${position}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((b: any) => b.isActive);
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const [
    { data: categories }, 
    { data: featuredProducts }, 
    newArrivals,
    heroBanners,
    promoBanners
  ] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ limit: "8" }),
    getActiveBanners("HERO"),
    getActiveBanners("PROMOTIONAL")
  ]);

  const promoBanner = promoBanners.length > 0 ? promoBanners[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={categories} suggestions={featuredProducts} />
      <main>
        <HeroSlider slides={heroBanners} />

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Vận chuyển nhanh", description: "Giao nội thành trong 24h", Icon: Truck },
              { title: "Đổi trả linh hoạt", description: "30 ngày cho sản phẩm nguyên tem", Icon: RefreshCw },
              { title: "Tư vấn chọn size", description: "Hỗ trợ chọn nệm và bộ ga phù hợp", Icon: Headphones },
              { title: "Chất lượng kiểm định", description: "Nguồn vải và foam rõ ràng", Icon: ShieldCheck },
            ].map(({ title, description, Icon }) => (
              <div key={title} className="flex gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Danh mục nổi bật</p>
              <h2 className="[font-family:var(--font-heading)] text-3xl font-semibold text-foreground">Chọn theo nhu cầu phòng ngủ</h2>
            </div>
            <Link href="/products" className="hidden text-sm font-semibold text-primary hover:underline sm:block">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold">{category.name}</h3>
                  <p className="text-sm text-white/80">{category._count?.products || 0} sản phẩm</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Bán chạy nhất</p>
              <h2 className="[font-family:var(--font-heading)] text-3xl font-semibold text-foreground">Được chọn nhiều trong tuần</h2>
            </div>
            <Link href="/products?sort=popular" className="text-sm font-semibold text-primary hover:underline">Xem thêm</Link>
          </div>
          <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {promoBanner && <PromotionalBanner banner={promoBanner} />}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Hàng mới về</p>
              <h2 className="[font-family:var(--font-heading)] text-3xl font-semibold text-foreground">Vừa có mặt tại Lumina</h2>
            </div>
          </div>
          <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.data.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm md:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Lumina Club</p>
            <h2 className="[font-family:var(--font-heading)] mt-2 text-3xl font-semibold text-foreground">Nhận lịch sale và mẹo chăm sóc giấc ngủ</h2>
            <form className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email của bạn"
                className="h-12 flex-1 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              <Button className="h-12 rounded-lg px-6">Đăng ký</Button>
            </form>
          </div>
        </section>
      </main>
      <StorefrontFooter categories={categories} />
    </div>
  );
}
