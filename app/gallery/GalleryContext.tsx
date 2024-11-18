"use client";

import { GalleryEvent } from "@/types/gallery";
import { createContext, ReactNode, useContext } from "react";

export const GalleryContext = createContext<GalleryEvent[]>([]);

interface GalleryProviderProps {
  children: ReactNode;
  events: GalleryEvent[];
}

export function GalleryProvider({ children, events }: GalleryProviderProps) {
  return (
    <GalleryContext.Provider value={events}>{children}</GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}
