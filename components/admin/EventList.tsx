"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { EditEventDialog } from "./EditEventDialog";

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string | null;
  formSchema?: {
    fields: Array<{
      id: string;
      label: string;
      name: string;
      type: string;
    }>;
    terms: Array<{
      id: string;
      text: string;
      order: number;
    }>;
  };
};

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (startDate: Date, endDate?: Date) => {
    if (!endDate) {
      return format(startDate, "PPp");
    }
    return `${format(startDate, "PP")} - ${format(endDate, "PP")}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>
                {formatEventDate(event.startDate, event.endDate)}
              </TableCell>
              <TableCell>{event.location || "N/A"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEditDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDeleteDialog(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditEventDialog
        event={
          selectedEvent
            ? {
                ...selectedEvent,
                startDate: selectedEvent.startDate.toISOString(),
                endDate:
                  selectedEvent.endDate?.toISOString() ||
                  selectedEvent.startDate.toISOString(),
              }
            : undefined
        }
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={fetchEvents}
      />

      <DeleteEventDialog
        event={selectedEvent}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onEventDeleted={fetchEvents}
      />
    </>
  );
}
