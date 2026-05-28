"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/storefront";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

type ProductImageSelectEvent = CustomEvent<{ urls?: string[] | null }>;

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [filterUrls, setFilterUrls] = useState<string[] | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const urls = (event as ProductImageSelectEvent).detail?.urls;
      if (urls && Array.isArray(urls)) {
        setFilterUrls(urls);
        setActiveIndex(0);
      } else {
        setFilterUrls(null);
      }
    };

    window.addEventListener("productImageSelect", handler);
    return () => window.removeEventListener("productImageSelect", handler);
  }, []);

  const displayedImages =
    filterUrls && filterUrls.length > 0
      ? images.filter((image) => filterUrls.includes(image.url))
      : images;

  const finalImages =
    displayedImages.length === 0 && filterUrls && filterUrls.length > 0
      ? filterUrls.map(
          (url, index) =>
            ({
              id: `override-${index}`,
              url,
              alt: `${productName} variant`,
              position: index,
            }) satisfies ProductImage,
        )
      : displayedImages;

  if (!finalImages?.length) {
    return (
      <div className="aspect-[4/5] flex-grow overflow-hidden rounded-xl bg-card shadow-lg">
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          Chưa có ảnh sản phẩm
        </div>
      </div>
    );
  }

  const safeActiveIndex = Math.min(activeIndex, finalImages.length - 1);

  const handleNext = () => {
    setActiveIndex((current) => (current === finalImages.length - 1 ? 0 : current + 1));
  };

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? finalImages.length - 1 : current - 1));
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:col-span-7 md:flex-row">
      <div className="hide-scrollbar flex shrink-0 gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-y-auto">
        {finalImages.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-square w-16 cursor-pointer overflow-hidden rounded-lg border transition-colors md:w-full",
              index === safeActiveIndex
                ? "border-2 border-primary ring-offset-2"
                : "border-border hover:border-primary",
            )}
            aria-label={`Xem ảnh ${index + 1} của ${productName}`}
          >
            <OptimizedImage
              src={image.url}
              alt={image.alt || `${productName} thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="group relative aspect-[4/5] flex-grow overflow-hidden rounded-xl bg-card shadow-lg">
        <OptimizedImage
          src={finalImages[safeActiveIndex]?.url}
          alt={finalImages[safeActiveIndex]?.alt || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 58vw"
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />

        {finalImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-background hover:text-primary group-hover:opacity-100"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-background hover:text-primary group-hover:opacity-100"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
