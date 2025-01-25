import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EventSignupForm from "./EventSignupForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField, EventTerms } from "@/lib/types/event-form";

const TIMEZONE = "Europe/Vienna";

interface EventDetailsDialogProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
    imageUrl?: string;
    formSchema?: {
      fields: FormField[];
      terms: EventTerms[];
    };
    signupPeriod?: {
      startDate: string;
      endDate: string;
    };
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

  const formatDateRange = (
    start: Date | string,
    end: Date | string | undefined
  ) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : undefined;

    if (!endDate || startDate.toDateString() === endDate.toDateString()) {
      return formatInTimeZone(startDate, TIMEZONE, "PPp (zzz)");
    }

    return `${formatInTimeZone(
      startDate,
      TIMEZONE,
      "PP p"
    )} - ${formatInTimeZone(endDate, TIMEZONE, "PP p (zzz)")}`;
  };

  const isEventEnded = () => {
    const endDate = new Date(event.endDate);
    const now = new Date();
    return endDate < now;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl h-[90vh] p-0 bg-background"
        aria-describedby="event-details-description"
      >
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription id="event-details-description">
            View details and information about this event, including date,
            location, and description.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full">
            {/* Image Section */}
            <div className="relative w-full aspect-video">
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
                  <span className="text-muted-foreground">
                    No image available
                  </span>
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
          formFields={event.formSchema?.fields || []}
          terms={event.formSchema?.terms || []}
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
        />
      )}
    </Dialog>
  );
}
