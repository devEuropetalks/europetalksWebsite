"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  lowQuality?: boolean;
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  quality = 75,
  loading,
  priority,
  lowQuality,
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        quality={lowQuality ? 10 : quality}
        loading={priority ? undefined : loading ?? "lazy"}
        priority={priority}
        onLoad={() => setIsLoaded(true)}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
} 