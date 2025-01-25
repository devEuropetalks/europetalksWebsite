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
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { FormField } from "@/lib/types/event-form";
import { EventTerms } from "@/lib/types/event-form";

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
    signupPeriod?: {
      startDate: string;
      endDate: string;
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

  const isRegistrationOpen = () => {
    const now = new Date();
    const signupStart = event.signupPeriod?.startDate
      ? new Date(event.signupPeriod.startDate)
      : new Date(0); // If not set, registration is open from the beginning
    const signupEnd = event.signupPeriod?.endDate
      ? new Date(event.signupPeriod.endDate)
      : new Date(event.startDate); // If not set, registration closes at event start

    return now >= signupStart && now <= signupEnd;
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
          <h3 className="text-lg font-semibold">{event.title}</h3>
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
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3">{event.description}</p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsSignupOpen(true);
            }}
            disabled={isEventEnded() || !isRegistrationOpen()}
          >
            {isEventEnded()
              ? t("eventCard.eventEnded")
              : !isRegistrationOpen()
              ? t("eventCard.registrationClosed")
              : t("eventCard.signUp")}
          </Button>
        </CardFooter>
      </Card>

      <EventDetailsDialog
        event={event}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

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
    </>
  );
}

export default EventCard;
