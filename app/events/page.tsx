"use client";

import EventCard from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import { useTranslation } from "react-i18next";
import useSWR from 'swr';

// Create a reusable fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await res.text();
    throw error;
  }
  
  return res.json();
};

export default function EventsPage() {
  const { t } = useTranslation("events");
  
  // Use SWR for data fetching with automatic caching and revalidation
  const { data, error, isLoading } = useSWR('/api/events', fetcher, {
    revalidateOnFocus: false, // Don't revalidate when window gets focus
    revalidateOnReconnect: true, // Revalidate when browser regains connection
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  if (error) {
    return (
      <ContentWrapper>
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">{t("events.errorLoading")}</h2>
            <p className="mt-2">{t("events.tryAgain")}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              {t("common.refresh")}
            </Button>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-pulse text-lg">{t("events.loading")}</div>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  const events = data?.upcoming || [];

  return (
    <ContentWrapper>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t("events.title")}</h1>
          <Button asChild>
            <Link href="/past-events">{t("events.viewPastEvents")}</Link>
          </Button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">{t("events.noEvents")}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
