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
import { useState } from "react";
import { EventFormConfig } from "@/lib/types/event-form";

interface EditEventDialogProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    location: string | null;
    imageUrl?: string;
    signupPeriodJson?: {
      startDate?: string;
      endDate?: string;
    };
    formFields?: EventFormConfig;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateEvent = async (
    data: EventFormData & { imageUrl?: string; formFields?: EventFormConfig }
  ) => {
    if (!event) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <EventForm
          onSubmit={handleUpdateEvent}
          defaultValues={{
            title: event.title,
            description: event.description,
            startDate:
              typeof event.startDate === "string"
                ? event.startDate
                : event.startDate.toISOString(),
            endDate: event.endDate
              ? typeof event.endDate === "string"
                ? event.endDate
                : event.endDate.toISOString()
              : undefined,
            location: event.location || "",
            imageUrl: event.imageUrl,
            signupPeriodJson: {
              startDate: event.signupPeriodJson?.startDate
                ? new Date(event.signupPeriodJson.startDate).toISOString()
                : undefined,
              endDate: event.signupPeriodJson?.endDate
                ? new Date(event.signupPeriodJson.endDate).toISOString()
                : undefined,
            },
            formFields: event.formFields || { fields: [], terms: [] },
          }}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
