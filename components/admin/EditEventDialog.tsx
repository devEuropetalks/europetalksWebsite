"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { EventFormData } from "@/lib/validations/event";
import { EventForm } from "./EventForm";

interface EditEventDialogProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated: () => void;
}

export function EditEventDialog({
  event,
  open,
  onOpenChange,
  onEventUpdated,
}: EditEventDialogProps) {
  const { toast } = useToast();

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!event) return;

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date).toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update event");

      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      onOpenChange(false);
      onEventUpdated();
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <EventForm
          onSubmit={handleUpdateEvent}
          defaultValues={{
            title: event.title,
            description: event.description,
            date: (event.date instanceof Date
              ? event.date
              : new Date(event.date)
            ).toISOString(),
            location: event.location || undefined,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
