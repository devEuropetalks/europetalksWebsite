import React from "react";
import { cn } from "@/lib/utils";

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  fullBleed?: boolean;
}

/**
 * A wrapper component that provides consistent padding and max-width for content
 * @param fullWidth - When true, removes the max-width constraint but keeps padding
 * @param fullBleed - When true, removes all constraints (padding and max-width)
 */
export default function ContentWrapper({
  children,
  className,
  fullWidth = false,
  fullBleed = false,
}: ContentWrapperProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        !fullBleed && "px-4 sm:px-6 md:px-8",
        !fullWidth && !fullBleed && "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
