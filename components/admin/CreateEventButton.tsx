"use client";

import { EventForm } from "@/components/admin/EventForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { EventFormData } from "@/lib/validations/event";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateEventButton() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateEvent = async (
    data: EventFormData & { imageUrl?: string }
  ) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create event");

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        aria-describedby="create-event-form-description"
        aria-label="Create event form"
      >
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <div id="create-event-form-description" className="sr-only">
            Form to create a new event. Contains fields for event details,
            dates, location, and registration settings.
          </div>
        </DialogHeader>
        <EventForm onSubmit={handleCreateEvent} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
