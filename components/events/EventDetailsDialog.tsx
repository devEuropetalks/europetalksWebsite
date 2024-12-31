import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EventSignupForm from "./EventSignupForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField } from "@/lib/types/event-form";

interface EventDetailsDialogProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
    imageUrl?: string;
    formFields?: { fields: FormField[] };
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsDialog({
  event,
  isOpen,
  onClose,
}: EventDetailsDialogProps) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const formatDateRange = (start: Date | string, end: Date | string | undefined) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : undefined;
    
    if (!endDate || startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, "PPp");
    }
    
    return `${format(startDate, "PP")} - ${format(endDate, "PP")}`;
  };

  const isEventEnded = () => {
    const endDate = new Date(event.endDate);
    const now = new Date();
    return endDate < now;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] p-0 sm:max-w-[1100px]">
        <DialogHeader className="sr-only">
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-[300px] md:h-[600px] bg-muted">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className={`object-contain transition-opacity duration-300 ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  quality={90}
                  onLoadingComplete={() => setIsImageLoading(false)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
              {isImageLoading && event.imageUrl && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{event.title}</h2>
                
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    <time dateTime={new Date(event.startDate).toISOString()}>
                      {formatDateRange(event.startDate, event.endDate)}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>

              {!isEventEnded() && (
                <div className="pt-6 mt-auto border-t">
                  <Button 
                    className="w-full" 
                    onClick={() => setIsSignupOpen(true)}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      {!isEventEnded() && (
        <EventSignupForm
          eventId={event.id}
          eventTitle={event.title}
          formFields={event.formFields?.fields || []}
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
        />
      )}
    </Dialog>
  );
} 