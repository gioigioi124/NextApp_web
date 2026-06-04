import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

export interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
}

export function PromotionalBanner({ banner }: { banner: BannerData | null }) {
  if (!banner) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-secondary text-secondary-foreground relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/40 z-10" />
        <div className="grid items-center gap-6 md:grid-cols-[1.2fr_0.8fr] relative z-20">
          <div className="p-8 md:p-12 lg:p-16">
            {banner.subtitle && (
              <p className="text-sm font-bold uppercase tracking-widest text-white/90">{banner.subtitle}</p>
            )}
            <h2 className="font-heading mt-3 text-4xl font-bold leading-tight sm:text-5xl text-white">
              {banner.title.split('\\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            {banner.description && (
              <p className="mt-4 max-w-xl text-lg text-white/90 leading-relaxed">
                {banner.description}
              </p>
            )}
            {banner.link && (
              <Link href={banner.link} className="mt-8 inline-flex">
                <Button size="lg" className="h-12 rounded-xl bg-white text-secondary hover:bg-white/90 px-8 font-semibold">
                  {banner.buttonText || "Khám phá ngay"}
                </Button>
              </Link>
            )}
          </div>
          <div className="relative hidden h-full min-h-[400px] md:block">
            <OptimizedImage
              src={banner.image}
              alt={banner.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
