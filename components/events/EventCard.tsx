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
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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

export function EventCard({ event }: EventCardProps) {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();
  console.log(event.imageUrl);
  const { t } = useTranslation("events");

  return (
    <Card className="flex flex-col h-full">
      {event.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover rounded-t-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      )}
      <CardHeader>
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-2xl font-semibold">{event.title}</h3>
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(eventDate, "PPP")}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPinIcon className="mr-2 h-4 w-4" />
            {event.location || t('eventCard.online')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{event.description}</p>
      </CardContent>
      <CardFooter>
        {!isPastEvent && (
          <Button className="w-full" onClick={() => setShowSignupForm(true)}>
            {t("eventCard.signUp")}
          </Button>
        )}
        {isPastEvent && (
          <Button className="w-full" variant="outline" disabled>
            {t("eventCard.eventEnded")}
          </Button>
        )}
      </CardFooter>

      <EventSignupForm
        eventId={event.id}
        eventTitle={event.title}
        isOpen={showSignupForm}
        onClose={() => setShowSignupForm(false)}
      />
    </Card>
  );
}
