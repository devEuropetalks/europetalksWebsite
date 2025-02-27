"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { EventFormData } from "@/lib/validations/event";
import { EventForm } from "./EventForm";
import { useState, useEffect } from "react";
import { EventFormConfig } from "@/lib/types/event-form";
import { Button } from "@/components/ui/button";

interface EditEventDialogProps {
  event?: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl?: string;
    formSchemaId?: string;
    signupPeriodJson?: {
      startDate: string | null;
      endDate: string | null;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditEventDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EditEventDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSchemas, setFormSchemas] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormSchemas = async () => {
      try {
        const response = await fetch("/api/admin/form-schemas");
        if (!response.ok) throw new Error("Failed to fetch form schemas");
        const data = await response.json();
        setFormSchemas(data);
      } catch (error) {
        console.error("Error fetching form schemas:", error);
        toast({
          title: "Error",
          description: "Failed to load form schemas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchFormSchemas();
    }
  }, [open, toast]);

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
      onSuccess?.();
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
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        aria-describedby="edit-event-description"
      >
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription id="edit-event-description">
            {formSchemas.length === 0 && !isLoading ? (
              <>
                Please create a form schema first in the Form Schemas section
                before editing an event. This will define the registration form
                that attendees will fill out.
              </>
            ) : (
              "Make changes to your event details, including title, description, dates, location, and registration settings."
            )}
          </DialogDescription>
        </DialogHeader>
        {(formSchemas.length > 0 || isLoading) && (
          <EventForm
            onSubmit={handleUpdateEvent}
            defaultValues={{
              title: event.title,
              description: event.description,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
              imageUrl: event.imageUrl,
              formSchemaId: event.formSchemaId || "",
              signupPeriodJson: event.signupPeriodJson || {
                startDate: null,
                endDate: null,
              },
            }}
            isSubmitting={isSubmitting}
            formSchemas={formSchemas}
            isEditMode={true}
          />
        )}
        {formSchemas.length === 0 && !isLoading && (
          <div className="p-6">
            <Button asChild>
              <a href="/admin/form-schemas">Create Form Schema</a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
