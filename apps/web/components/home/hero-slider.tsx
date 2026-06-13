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
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="relative w-full">
              <div className="relative h-[450px] w-full md:h-[600px]">
                <OptimizedImage
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center p-6 md:p-12 lg:p-16">
                  <div className="max-w-xl text-white">
                    <p className="mb-4 text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-white/90 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <h1 className="font-heading text-4xl font-light leading-tight sm:text-5xl text-white tracking-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="mt-5 text-sm md:text-base leading-relaxed text-white/90 font-light drop-shadow-md">
                      {slide.description}
                    </p>
                    <div className="mt-8 flex gap-4">
                      <Link href={slide.link || "#"}>
                        <Button className="h-12 gap-2 bg-white px-8 text-black hover:bg-white/90 rounded-full font-medium transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                          {slide.buttonText}
                          <ArrowRight className="size-4 stroke-[1.5]" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-8 right-8 flex items-center gap-3">
          <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white hover:text-black border border-white/30 backdrop-blur-md transition-all duration-300" />
          <CarouselNext className="static translate-y-0 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white hover:text-black border border-white/30 backdrop-blur-md transition-all duration-300" />
        </div>
      </Carousel>
    </div>
  );
}
