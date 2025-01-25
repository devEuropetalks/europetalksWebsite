"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date | null;
  _count: {
    signups: number;
  };
}

export default function SignupsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/admin/signups");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const downloadCsv = async (eventId: string, eventTitle: string) => {
    try {
      const response = await fetch(`/api/admin/signups/${eventId}/export`);
      if (!response.ok) throw new Error("Failed to export data");
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventTitle
        .toLowerCase()
        .replace(/\s+/g, "-")}-signups.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download CSV:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Event Signups</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Signups</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>
                {format(new Date(event.startDate), "PP")}
                {event.endDate && ` - ${format(new Date(event.endDate), "PP")}`}
              </TableCell>
              <TableCell>{event._count.signups}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/signups/${event.id}`}
                    className="text-primary hover:underline"
                  >
                    View Details
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCsv(event.id, event.title)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
