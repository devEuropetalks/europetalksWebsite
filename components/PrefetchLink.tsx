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
}

export function PrefetchLink({
  children,
  className,
  prefetch = true,
  prefetchData,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const prefetchResources = useCallback(() => {
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

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to prefetch after a short delay
    timeoutRef.current = setTimeout(prefetchResources, 100);
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
      className={cn(className)}
      prefetch={prefetch}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}
