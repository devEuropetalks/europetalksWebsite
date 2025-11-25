"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { preload } from "swr";
import { fetcher } from "@/lib/api-client";

interface PrefetchLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  prefetchData?: string; // API endpoint to prefetch
  prefetchOnViewport?: boolean; // Prefetch when link enters viewport
}

export function PrefetchLink({
  children,
  className,
  prefetch = true,
  prefetchData,
  prefetchOnViewport = false,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasPrefetched = useRef(false);

  const prefetchResources = useCallback(() => {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;

    // Prefetch the page
    if (prefetch && props.href) {
      router.prefetch(props.href.toString());
    }

    // Prefetch API data if specified
    if (prefetchData) {
      preload(prefetchData, fetcher);
    } else if (props.href === "/events") {
      // Default prefetch for events page
      preload("/api/events", fetcher);
    }
  }, [prefetch, prefetchData, props.href, router]);

  // Viewport-based prefetching using Intersection Observer
  useEffect(() => {
    if (!prefetchOnViewport || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchResources();
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" } // Start prefetching 100px before visible
    );

    if (linkRef.current) {
      observer.observe(linkRef.current);
    }

    return () => observer.disconnect();
  }, [prefetchOnViewport, prefetchResources]);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to prefetch after a short delay
    timeoutRef.current = setTimeout(prefetchResources, 50); // Reduced from 100ms
  };

  const handleMouseLeave = () => {
    // Clear the timeout if the user moves away quickly
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Touch device support - prefetch on touch start
  const handleTouchStart = () => {
    prefetchResources();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Link
      ref={linkRef}
      className={cn(className)}
      prefetch={prefetch}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {children}
    </Link>
  );
}
