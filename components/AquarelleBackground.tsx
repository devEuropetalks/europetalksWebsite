import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Color = "blau" | "rot" | "gelb" | "grün";

interface Props {
  fixedColor: Color;
  className?: string;
  children: React.ReactNode;
  priority?: boolean;
}

export function AquarelleBackground({
  fixedColor,
  className = "",
  children,
  priority = false,
}: Props) {
  // Use useState with lazy initializer to generate random number only once
  const [randomNumber] = useState(() => Math.floor(Math.random() * 8) + 1);
  const [isVisible, setIsVisible] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use WebP for better performance
  const imagePath = `/images/aquarelle/${fixedColor}/${randomNumber}.webp`;

  // Intersection Observer for lazy loading if not priority
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" } // Start loading 50px before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {isVisible && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={imagePath}
            alt="Background"
            fill
            className="object-cover opacity-25"
            quality={60} // Lower quality since it's at 25% opacity anyway
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
            loading={priority ? undefined : "lazy"}
          />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
