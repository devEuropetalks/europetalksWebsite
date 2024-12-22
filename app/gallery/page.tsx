"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useGallery } from "./GalleryContext";

export default function GalleryPage() {
  const events = useGallery();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const currentImages =
    events.find((e) => e.id === selectedImage)?.images || [];

  const nextImage = () => {
    setCurrentEventIndex((prev) =>
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentEventIndex((prev) =>
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Gallery</h1>

      {events.map((event) => (
        <div key={event.id} className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-6">
            <h2 className="text-2xl font-semibold">{event.name}</h2>
            <div className="text-muted-foreground">
              <span>{event.location} • </span>
              <span>{format(event.date, "MMMM yyyy")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {event.images.map((image, index) => (
              <div
                key={image}
                className="relative aspect-square cursor-pointer group"
                onClick={() => {
                  setSelectedImage(event.id);
                  setCurrentEventIndex(index);
                }}
              >
                <Image
                  src={image}
                  alt={`${event.name} image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog
        open={selectedImage !== null}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-6">
          <DialogHeader className="absolute top-4 right-4 z-20">
            <DialogTitle className="sr-only">Gallery Image Viewer</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-full flex items-center justify-center bg-background rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 hover:bg-black/10"
              onClick={previousImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            {selectedImage && currentImages[currentEventIndex] && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentImages[currentEventIndex]}
                  alt={`${selectedImage} image ${currentEventIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="95vw"
                  priority
                />
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 hover:bg-black/10"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
