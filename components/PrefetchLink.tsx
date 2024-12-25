"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, useCallback, useEffect, useRef } from "react";

type PrefetchLinkProps = ComponentProps<typeof Link>;

export function PrefetchLink({ href, ...props }: PrefetchLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const prefetchData = useCallback(async () => {
    // If it's the events page, prefetch the events data
    if (href === "/events") {
      try {
        await fetch("/api/events");
      } catch (error) {
        console.error("Error prefetching events:", error);
      }
    }
    
    // Prefetch the page
    router.prefetch(href.toString());
  }, [href, router]);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to prefetch after a short delay
    timeoutRef.current = setTimeout(prefetchData, 100);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if the user moves away quickly
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
} 