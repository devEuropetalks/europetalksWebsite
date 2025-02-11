import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalendarIcon, MapPinIcon, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EventSignupForm from "./EventSignupForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField, EventTerms } from "@/lib/types/event-form";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
    signup_period_json?: {
      startDate: string | null;
      endDate: string | null;
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
    const isSameDay =
      endDate && startDate.toDateString() === endDate.toDateString();

    if (!endDate || isSameDay) {
      // For single-day events, show date and time in local timezone
      return format(startDate, "PPp");
    }

    // For multi-day events, show only dates
    return `${format(startDate, "PP")} - ${format(endDate, "PP")}`;
  };

  const isEventEnded = () => {
    const endDate = new Date(event.endDate);
    const now = new Date();
    return endDate < now;
  };

  const getRegistrationStatus = () => {
    const now = new Date();
    
    if (!event.signup_period_json) {
      return now > new Date(event.startDate) ? "closed" : "open";
    }

    // If both dates are set in signup_period_json, use them directly
    if (event.signup_period_json.startDate && event.signup_period_json.endDate) {
      const signupStart = new Date(event.signup_period_json.startDate);
      const signupEnd = new Date(event.signup_period_json.endDate);

      if (now < signupStart) {
        return "not_started";
      } else if (now > signupEnd) {
        return "closed";
      }
      return "open";
    }

    // Fallback behavior for when only some dates are set
    const signupStart = event.signup_period_json.startDate
      ? new Date(event.signup_period_json.startDate)
      : new Date(0); // If not set, registration is open from the beginning
    const signupEnd = event.signup_period_json.endDate
      ? new Date(event.signup_period_json.endDate)
      : new Date(event.startDate); // If not set, registration closes at event start

    if (now < signupStart) {
      return "not_started";
    } else if (now > signupEnd) {
      return "closed";
    }
    return "open";
  };

  const registrationStatus = getRegistrationStatus();
  const isRegistrationOpen = registrationStatus === "open";

  const getRegistrationPeriodText = () => {
    if (!event.signup_period_json) {
      return `Registration open until event starts (${format(new Date(event.startDate), "PPp")})`;
    }

    if (!event.signup_period_json.startDate && !event.signup_period_json.endDate) {
      return "Registration open until event starts";
    }

    const start = event.signup_period_json.startDate
      ? format(new Date(event.signup_period_json.startDate), "PPp")
      : "now";
    const end = event.signup_period_json.endDate
      ? format(new Date(event.signup_period_json.endDate), "PPp")
      : format(new Date(event.startDate), "PPp");

    return `Registration: ${start} - ${end}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl h-[90vh] p-0 bg-background"
        aria-describedby="event-details-description"
      >
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-3xl font-semibold">
            {event.title}
          </DialogTitle>
          <div className="flex flex-col gap-2">
            <DialogDescription
              id="event-details-description"
              className="text-sm"
            >
              View details and information about this event, including date,
              location, and description.
            </DialogDescription>
            <Badge 
              variant={
                registrationStatus === "open" ? "default" :
                registrationStatus === "not_started" ? "secondary" : "destructive"
              }
              className="w-fit"
            >
              {registrationStatus === "open" ? "Registration Open" :
               registrationStatus === "not_started" ? "Registration Not Started" :
               "Registration Closed"}
            </Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {/* Image Section */}
            <div className="relative w-full aspect-[16/9] flex items-center justify-center bg-muted">
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
                <span className="text-muted-foreground">
                  No image available
                </span>
              )}
              {isImageLoading && event.imageUrl && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
            </div>

            {/* Content Section */}
            <div className="p-4">
              <div className="space-y-3">
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{getRegistrationPeriodText()}</span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>

              {!isEventEnded() && (
                <div className="pt-4 mt-4 border-t">
                  {!isRegistrationOpen && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        {registrationStatus === "not_started"
                          ? "Registration has not started yet. Please check back later."
                          : "Registration period has ended. No more signups are being accepted."}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => setIsSignupOpen(true)}
                    disabled={!isRegistrationOpen}
                    variant={isRegistrationOpen ? "default" : "secondary"}
                  >
                    {registrationStatus === "not_started"
                      ? "Registration Not Started"
                      : registrationStatus === "closed"
                      ? "Registration Closed"
                      : "Sign Up"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      {!isEventEnded() && isRegistrationOpen && (
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
