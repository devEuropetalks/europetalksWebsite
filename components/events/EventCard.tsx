import EventSignupForm from "@/components/events/EventSignupForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
    imageUrl?: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { t } = useTranslation();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const formatDateRange = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isSameDay(startDate, endDate)) {
      return format(startDate, "PPP");
    }

    return `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`;
  };

  return (
    <Card className="overflow-hidden">
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
        <p className="text-sm">{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => setIsSignupOpen(true)}
        >
          {t("events.signUp")}
        </Button>
      </CardFooter>
      <EventSignupForm
        eventId={event.id}
        eventTitle={event.title}
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
      />
    </Card>
  );
}

// Add default export that references the named export
export default EventCard;
