import EventSignupForm from "@/components/events/EventSignupForm";
import EventDetailsDialog from "@/components/events/EventDetailsDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, Clock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { FormField } from "@/lib/types/event-form";
import { EventTerms } from "@/lib/types/event-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
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
}

export function EventCard({ event }: EventCardProps) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { t } = useTranslation("events");
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
    <>
      <Card
        className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setIsDetailsOpen(true)}
      >
        {event.imageUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={90}
              onLoadingComplete={() => setIsImageLoading(false)}
            />
            {isImageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <Badge variant={
              registrationStatus === "open" ? "default" :
              registrationStatus === "not_started" ? "secondary" : "destructive"
            }>
              {registrationStatus === "open" ? "Registration Open" :
               registrationStatus === "not_started" ? "Registration Not Started" :
               "Registration Closed"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={new Date(event.startDate).toISOString()}>
                {formatDateRange(event.startDate, event.endDate)}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">{getRegistrationPeriodText()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3">{event.description}</p>
          {!isRegistrationOpen && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                {registrationStatus === "not_started"
                  ? "Registration has not started yet. Please check back later."
                  : "Registration period has ended. No more signups are being accepted."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsSignupOpen(true);
            }}
            disabled={isEventEnded() || !isRegistrationOpen}
            variant={isRegistrationOpen ? "default" : "secondary"}
          >
            {isEventEnded()
              ? t("eventCard.eventEnded")
              : !isRegistrationOpen
              ? registrationStatus === "not_started"
                ? "Registration Not Started"
                : "Registration Closed"
              : t("eventCard.signUp")}
          </Button>
        </CardFooter>
      </Card>

      <EventDetailsDialog
        event={event}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

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
    </>
  );
}

export default EventCard;
