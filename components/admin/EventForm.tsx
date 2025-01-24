"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { eventFormSchema, type EventFormData } from "@/lib/validations/event";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { UploadButton } from "@/utils/uploadthing";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  ImageIcon,
  Loader2,
  X,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FormFieldsEditor } from "./FormFieldsEditor";
import { EventFormConfig } from "@/lib/types/event-form";

interface EventFormProps {
  onSubmit: (
    data: EventFormData & { imageUrl?: string; formFields?: EventFormConfig }
  ) => void;
  defaultValues?: EventFormData & {
    imageUrl?: string;
    formFields?: EventFormConfig;
  };
  isSubmitting?: boolean;
}

export function EventForm({
  onSubmit,
  defaultValues,
  isSubmitting,
}: EventFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    defaultValues?.imageUrl
  );
  const [formFields, setFormFields] = useState<EventFormConfig>(() => ({
    fields: (defaultValues?.formFields?.fields || []).map((field) => ({
      id: field.id || crypto.randomUUID(),
      type: field.type || "text",
      label: field.label || "",
      name: field.name || "",
      required: field.required || false,
      placeholder: field.placeholder,
      description: field.description,
      options: field.options,
      validation: field.validation,
    })),
    terms: defaultValues?.formFields?.terms || [],
  }));
  const [isMultiDay, setIsMultiDay] = useState(() => {
    if (!defaultValues?.startDate || !defaultValues?.endDate) return false;
    const startDate = new Date(defaultValues.startDate);
    const endDate = new Date(defaultValues.endDate);
    return startDate.toDateString() !== endDate.toDateString();
  });
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      startDate: defaultValues?.startDate || "",
      endDate: defaultValues?.endDate || defaultValues?.startDate || "",
      location: defaultValues?.location || "",
    },
  });

  const handleSubmit = async (values: EventFormData) => {
    try {
      let endDate = values.endDate;
      if (!isMultiDay && values.startDate) {
        // For single-day events, set endDate to the end of the selected day
        const date = new Date(values.startDate);
        date.setHours(23, 59, 59, 999);
        endDate = date.toISOString();
      }

      // Ensure endDate is always set
      if (!endDate) {
        endDate = values.startDate;
      }

      // Combine form fields and terms, ensuring required fields
      const formFieldsWithTerms = {
        ...formFields,
        terms: (values.terms || []).map(term => ({
          id: term.id || crypto.randomUUID(),
          text: term.text || ""
        }))
      };

      onSubmit({
        ...values,
        endDate,
        imageUrl: imageUrl,
        formFields: formFieldsWithTerms,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save event. Please check all required fields are filled correctly.",
        variant: "destructive",
      });
    }
  };

  const addTerm = () => {
    const newTerm = {
      id: crypto.randomUUID(),
      text: "",
    };
    setFormFields((prev) => ({
      ...prev,
      terms: [...prev.terms, newTerm],
    }));
  };

  const removeTerm = (index: number) => {
    const newTerms = formFields.terms.filter((_, i) => i !== index);
    setFormFields((prev) => ({
      ...prev,
      terms: newTerms,
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter event title"
                      className="max-w-3xl"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a clear and descriptive title for your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your event..."
                      className="min-h-[150px] max-w-3xl"
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the event, including what
                    attendees can expect
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Switch
                checked={isMultiDay}
                onCheckedChange={(checked) => {
                  setIsMultiDay(checked);
                  if (!checked) {
                    const startDate = form.getValues("startDate");
                    form.setValue("endDate", startDate);
                  }
                }}
                id="multi-day"
              />
              <label htmlFor="multi-day" className="text-sm font-medium">
                Multi-day event
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {isMultiDay ? "Start Date" : "Date and Time"}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal w-full md:w-[280px]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(
                                new Date(field.value),
                                isMultiDay ? "PPP" : "PPP p"
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              if (isMultiDay) {
                                date.setHours(0, 0, 0, 0);
                              } else {
                                const currentDate = new Date();
                                date.setHours(
                                  currentDate.getHours(),
                                  currentDate.getMinutes()
                                );
                              }
                              field.onChange(date.toISOString());
                            }
                          }}
                          initialFocus
                          showOutsideDays={false}
                        />
                        {!isMultiDay && (
                          <div className="p-3 border-t flex items-center gap-2">
                            <Clock className="h-4 w-4 opacity-50" />
                            <input
                              type="time"
                              id="event-start-time"
                              name="event-start-time"
                              className="w-full min-w-[150px] px-2 py-1 rounded-md border"
                              onChange={(e) => {
                                const date = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                date.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                field.onChange(date.toISOString());
                              }}
                              value={
                                field.value
                                  ? format(new Date(field.value), "HH:mm")
                                  : ""
                              }
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {isMultiDay
                        ? "Select the start date of your event"
                        : "Select the date and time of your event"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isMultiDay && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal w-full md:w-[280px]",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                date.setHours(23, 59, 59, 999);
                                field.onChange(date.toISOString());
                              }
                            }}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate && date < new Date(startDate);
                            }}
                            initialFocus
                            showOutsideDays={false}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select the end date of your multi-day event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Registration Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="signupPeriodJson.startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Registration Opens</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal w-full md:w-[280px]",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>Immediately (default)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const currentDate = new Date();
                                date.setHours(
                                  currentDate.getHours(),
                                  currentDate.getMinutes()
                                );
                                field.onChange(date.toISOString());
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t flex items-center gap-2">
                            <Clock className="h-4 w-4 opacity-50" />
                            <input
                              type="time"
                              id="registration-start-time"
                              name="registration-start-time"
                              className="w-full min-w-[150px] px-2 py-1 rounded-md border"
                              onChange={(e) => {
                                const date = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                date.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                field.onChange(date.toISOString());
                              }}
                              value={
                                field.value
                                  ? format(new Date(field.value), "HH:mm")
                                  : ""
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When should registration open? Leave empty to open
                        immediately.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signupPeriodJson.endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Registration Closes</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal w-full md:w-[280px]",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>At event start (default)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const currentDate = new Date();
                                date.setHours(
                                  currentDate.getHours(),
                                  currentDate.getMinutes()
                                );
                                field.onChange(date.toISOString());
                              }
                            }}
                            disabled={(date) => {
                              const eventStart = form.getValues("startDate");
                              return eventStart && date > new Date(eventStart);
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t flex items-center gap-2">
                            <Clock className="h-4 w-4 opacity-50" />
                            <input
                              type="time"
                              id="registration-end-time"
                              name="registration-end-time"
                              className="w-full min-w-[150px] px-2 py-1 rounded-md border"
                              onChange={(e) => {
                                const date = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                date.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                field.onChange(date.toISOString());
                              }}
                              value={
                                field.value
                                  ? format(new Date(field.value), "HH:mm")
                                  : ""
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When should registration close? Leave empty to close at
                        event start.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter event location"
                      className="max-w-3xl"
                    />
                  </FormControl>
                  <FormDescription>
                    Specify where the event will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Event Image</FormLabel>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden group">
                    <Image
                      src={imageUrl}
                      alt="Event preview"
                      className="object-cover"
                      fill
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl(undefined)}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Card className="w-40 h-40 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </Card>
                )}
                <div className="space-y-2">
                  <UploadButton
                    endpoint="imageUploader"
                    onUploadBegin={() => {
                      setIsUploading(true);
                    }}
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) {
                        setImageUrl(res[0].url);
                        toast({
                          title: "Image uploaded",
                          description:
                            "Your event image has been uploaded successfully.",
                        });
                      }
                      setIsUploading(false);
                    }}
                    onUploadError={(error: Error) => {
                      toast({
                        title: "Upload failed",
                        description: error.message,
                        variant: "destructive",
                      });
                      setIsUploading(false);
                    }}
                  />
                  <FormDescription>
                    Upload an image for your event. Recommended size: 1200x800px
                  </FormDescription>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <FormFieldsEditor
                value={formFields.fields}
                onChange={(fields) =>
                  setFormFields({ fields, terms: formFields.terms })
                }
              />
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Terms and Conditions</h3>
              <div className="space-y-4">
                {formFields.terms.map((term, index) => (
                  <div key={term.id} className="flex gap-4">
                    <FormField
                      control={form.control}
                      name={`terms.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter terms text..."
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTerm(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTerm()}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Terms
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
