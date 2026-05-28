import Link from "next/link";
import { ArrowRight, Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getCategories, getFeaturedProducts, getProducts } from "@/services/catalog.service";

export default async function Home() {
  const [{ data: categories }, { data: featuredProducts }, newArrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ limit: "8" }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={categories} suggestions={featuredProducts} />
      <main>
        <section className="relative overflow-hidden bg-[#E8EBFA]">
          <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="z-10 max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                Bộ sưu tập nghỉ ngơi 2026
              </p>
              <h1 className="[font-family:var(--font-heading)] text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
                Giấc ngủ ngon bắt đầu từ những điều nhỏ nhẹ
              </h1>
              <p className="mt-5 text-base leading-7 text-foreground/75 sm:text-lg">
                Chăn ga, gối và nệm được chọn lọc cho khí hậu Việt Nam: mềm, thoáng, dễ chăm sóc và bền trong nhịp sống hằng ngày.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button className="h-12 w-full gap-2 rounded-lg bg-primary px-6 text-base sm:w-auto">
                    Khám phá ngay
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/categories/bo-chan-ga">
                  <Button variant="outline" className="h-12 w-full rounded-lg bg-white/70 px-6 text-base sm:w-auto">
                    Xem bộ chăn ga
                  </Button>
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-foreground/70 sm:grid-cols-3">
                <span className="flex items-center gap-2"><Truck className="size-4 text-secondary" /> Miễn phí ship</span>
                <span className="flex items-center gap-2"><RefreshCw className="size-4 text-secondary" /> Đổi trả 30 ngày</span>
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-secondary" /> Hàng chính hãng</span>
              </div>
            </div>
            <div className="relative min-h-[320px] lg:min-h-[460px]">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85"
                alt="Phòng ngủ sáng với bộ chăn ga cao cấp"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="absolute inset-0 h-full w-full rounded-lg object-cover shadow-2xl"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bán chạy tháng này</p>
                <p className="mt-1 font-semibold text-foreground">Cotton Sateen 500TC</p>
              </div>
            </div>
          </div>
        </section>

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

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-primary text-primary-foreground">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_0.8fr]">
              <div className="p-8 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Ưu đãi theo mùa</p>
                <h2 className="[font-family:var(--font-heading)] mt-2 text-3xl font-semibold">Làm mới phòng ngủ với combo tiết kiệm</h2>
                <p className="mt-3 max-w-xl text-white/75">
                  Chọn đồng bộ chăn, ga, gối và topper với bảng màu dịu mắt. Áp dụng cho đơn combo từ 2 sản phẩm.
                </p>
                <Link href="/products?maxPrice=2000000" className="mt-6 inline-flex">
                  <Button variant="secondary" className="h-11 rounded-lg px-5">Mua combo</Button>
                </Link>
              </div>
              <div className="relative h-72 md:h-full md:min-h-80">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85"
                  alt="Bộ phòng ngủ tối giản"
                  fill
                  sizes="(max-width: 768px) 100vw, 44vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

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
