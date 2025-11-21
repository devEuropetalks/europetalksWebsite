"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

interface SlideshowProps {
  interval?: number;
}

// Simple blur data URL for loading placeholder
const blurDataURL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+";

// Generate array of images from 26 to 1 (newest first)
const images = Array.from({ length: 26 }, (_, i) => {
  const num = 26 - i; // Start from 26 and count down
  const fileExtension =
    num === 1
      ? ".jpeg"
      : num === 13 || num === 17 || num === 19
      ? ".png"
      : ".jpg";
  const imagePath = `/images/slideshow/quotes${num}${fileExtension}`;

  return {
    src: imagePath,
    alt: `Europe Talks Quote ${num}`,
  };
});

export function Slideshow({ interval = 5000 }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Preload the next few images
  useEffect(() => {
    const preloadCount = 3; // Number of images to preload
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = (currentIndex + i) % images.length;
      const preloadImage = document.createElement("img");
      preloadImage.src = images[nextIndex].src;
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setIsLoading(true);
    setCurrentIndex((current) => (current + 1) % images.length);
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setIsLoading(true);
    setCurrentIndex((current) => (current - 1 + images.length) % images.length);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="aspect-square relative rounded-lg overflow-hidden group">
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          quality={90}
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 448px, 448px"
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoadingComplete={() => setIsLoading(false)}
        />

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 flex-wrap px-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => {
                setIsAutoPlaying(false);
                setIsLoading(true);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
