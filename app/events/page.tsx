"use client";

import EventCard from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapper";
import { useTranslation } from "react-i18next";

export default function EventsPage() {
  const { t } = useTranslation("events");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        setEvents(data.upcoming);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (isLoading) {
    return <div>{t("events.loading")}</div>;
  }

  return (
    <ContentWrapper>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t("events.title")}</h1>
          <Button variant="outline" asChild>
            <Link href="/past-events">{t("events.viewPastEvents")}</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </ContentWrapper>
  );
}
