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
import { EditEventDialog } from "./EditEventDialog";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EventResponse = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string | null;
  imageUrl?: string;
  formSchemaId?: string;
  signup_period_json?: {
    startDate: string | null;
    endDate: string | null;
  };
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

type Event = Omit<EventResponse, "startDate" | "endDate" | "signup_period_json"> & {
  startDate: Date;
  endDate?: Date;
  signupPeriodJson?: {
    startDate: string | null;
    endDate: string | null;
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
      setEvents(
        data.map((event: EventResponse) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          signupPeriodJson: event.signup_period_json || { startDate: null, endDate: null }
        }))
      );
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setShowDeleteDialog(false);
      setSelectedEvent(null);
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
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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
                signupPeriodJson: selectedEvent.signupPeriodJson || {
                  startDate: null,
                  endDate: null
                }
              }
            : undefined
        }
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={fetchEvents}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event &quot;
              {selectedEvent?.title}&quot; and all its signups. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => selectedEvent && deleteEvent(selectedEvent.id)}
            >
              Delete Event
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
