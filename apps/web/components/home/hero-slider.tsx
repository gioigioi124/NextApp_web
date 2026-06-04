"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
}

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  );

  if (!slides || slides.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
      <Carousel
        opts={{ loop: true }}
        plugins={[plugin.current]}
        className="w-full overflow-hidden rounded-2xl shadow-xl"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="relative w-full">
              <div className="relative h-[400px] w-full md:h-[500px]">
                <OptimizedImage
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === 1}
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
                <div className="absolute inset-0 flex items-center p-6 md:p-12">
                  <div className="max-w-xl rounded-2xl bg-black/30 p-6 md:p-8 backdrop-blur-[1px] text-white border border-white/10 shadow-2xl">
                    <p className="mb-3 text-xs md:text-sm font-bold uppercase tracking-widest text-primary-foreground/90">
                      {slide.subtitle}
                    </p>
                    <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl text-white">
                      {slide.title}
                    </h1>
                    <p className="mt-4 text-sm md:text-base leading-relaxed text-white/90">
                      {slide.description}
                    </p>
                    <div className="mt-6 flex gap-4">
                      <Link href={slide.link}>
                        <Button className="h-11 gap-2 bg-primary px-6 text-primary-foreground hover:bg-primary/90 rounded-xl">
                          {slide.buttonText}
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <CarouselPrevious className="static translate-y-0 h-10 w-10 bg-black/40 text-white hover:bg-black hover:text-white border-white/20 backdrop-blur-md" />
          <CarouselNext className="static translate-y-0 h-10 w-10 bg-black/40 text-white hover:bg-black hover:text-white border-white/20 backdrop-blur-md" />
        </div>
      </Carousel>
    </div>
  );
}
