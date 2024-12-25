import EventSignupForm from "@/components/events/EventSignupForm";
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
import { OptimizedImage } from "../OptimizedImage";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: Date | string;
    location: string;
    imageUrl?: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      {event.imageUrl && (
        <div className="relative h-48 w-full">
          <OptimizedImage
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            lowQuality={!isSignupOpen} // Load high quality when form is open
          />
        </div>
      )}
      <CardHeader>
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <time dateTime={new Date(event.date).toISOString()}>
              {format(new Date(event.date), "PPP")}
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
