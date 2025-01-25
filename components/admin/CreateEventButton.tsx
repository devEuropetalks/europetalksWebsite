"use client";

import { EventForm } from "@/components/admin/EventForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { EventFormData } from "@/lib/validations/event";
import type { EventFormConfig } from "@/lib/types/event-form";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

export function CreateEventButton() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
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

    if (isOpen) {
      fetchFormSchemas();
    }
  }, [isOpen, toast]);

  const handleCreateEvent = async (
    data: EventFormData & { imageUrl?: string; formFields?: EventFormConfig }
  ) => {
    setIsSubmitting(true);

    try {
      // Transform the data to match the API's expected format
      const transformedData = {
        ...data,
        endDate: data.endDate || data.startDate, // Ensure endDate is set
        signupPeriodJson: {
          startDate: data.signupPeriodJson?.startDate || null,
          endDate: data.signupPeriodJson?.endDate || null,
        },
      };

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData ? JSON.stringify(errorData) : "Failed to create event"
        );
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create event. Please try again.",
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
        aria-describedby="create-event-description"
      >
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription id="create-event-description">
            {formSchemas.length === 0 && !isLoading ? (
              <>
                Please create a form schema first in the Form Schemas section
                before creating an event. This will define the registration form
                that attendees will fill out.
              </>
            ) : (
              "Fill in the details to create a new event. Add title, description, dates, location, and registration settings."
            )}
          </DialogDescription>
        </DialogHeader>
        {(formSchemas.length > 0 || isLoading) && (
          <EventForm
            onSubmit={handleCreateEvent}
            isSubmitting={isSubmitting}
            formSchemas={formSchemas}
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
