"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Image = {
  url: string;
  alt?: string;
};

type ProductGalleryProps = {
  images: Image[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images?.length) {
    return (
      <div className="group flex-grow aspect-[4/5] overflow-hidden rounded-xl bg-card shadow-lg">
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          No image available
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:col-span-7 md:flex-row">
      {/* Thumbnails */}
      <div className="hide-scrollbar flex shrink-0 gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-y-auto">
        {images.map((image, idx) => (
          <button
            key={image.url}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "aspect-square w-16 cursor-pointer overflow-hidden rounded-lg border md:w-full transition-colors",
              idx === activeIndex
                ? "border-2 border-primary ring-offset-2"
                : "border-border hover:border-primary",
            )}
          >
            <img
              src={image.url}
              alt={image.alt || `${productName} thumbnail ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      
      {/* Main Image */}
      <div className="group relative flex-grow aspect-[4/5] overflow-hidden rounded-xl bg-card shadow-lg">
        <img
          src={images[activeIndex]?.url}
          alt={images[activeIndex]?.alt || productName}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-background hover:text-primary opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-background hover:text-primary opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
