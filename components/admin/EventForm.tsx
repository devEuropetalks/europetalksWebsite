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
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { CalendarIcon, Clock, Loader2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONE = "Europe/Vienna";

interface EventFormProps {
  onSubmit: (data: EventFormData & { imageUrl?: string }) => void;
  defaultValues?: EventFormData & { imageUrl?: string };
  isSubmitting?: boolean;
  formSchemas: Array<{ id: string; name: string }>;
}

export function EventForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  formSchemas,
}: EventFormProps) {
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    defaultValues?.imageUrl
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      startDate: defaultValues?.startDate || new Date().toISOString(),
      endDate: defaultValues?.endDate || new Date().toISOString(),
      location: defaultValues?.location || "",
      formSchemaId: defaultValues?.formSchemaId || "",
      signupPeriodJson: {
        startDate: defaultValues?.signupPeriodJson?.startDate || null,
        endDate: defaultValues?.signupPeriodJson?.endDate || null,
      },
    },
  });

  const handleSubmit = async (data: EventFormData) => {
    onSubmit({
      ...data,
      imageUrl,
    });
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
                    <FormLabel>{isMultiDay ? "Start Date" : "Date"}</FormLabel>
                    <div className="flex flex-col gap-2">
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
                                formatInTimeZone(
                                  new Date(field.value),
                                  TIMEZONE,
                                  "PPP"
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
                              field.value
                                ? toZonedTime(new Date(field.value), TIMEZONE)
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const currentValue = field.value
                                  ? toZonedTime(new Date(field.value), TIMEZONE)
                                  : toZonedTime(new Date(), TIMEZONE);
                                date.setHours(
                                  currentValue.getHours(),
                                  currentValue.getMinutes()
                                );
                                field.onChange(
                                  fromZonedTime(date, TIMEZONE).toISOString()
                                );
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          className="w-[140px]"
                          value={
                            field.value
                              ? formatInTimeZone(
                                  new Date(field.value),
                                  TIMEZONE,
                                  "HH:mm"
                                )
                              : ""
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const date = field.value
                              ? toZonedTime(new Date(field.value), TIMEZONE)
                              : toZonedTime(new Date(), TIMEZONE);
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(
                              fromZonedTime(date, TIMEZONE).toISOString()
                            );
                          }}
                        />
                        <Clock className="h-4 w-4 opacity-50" />
                      </div>
                    </div>
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
                      <div className="flex flex-col gap-2">
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
                                  formatInTimeZone(
                                    new Date(field.value),
                                    TIMEZONE,
                                    "PPP"
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
                                field.value
                                  ? toZonedTime(new Date(field.value), TIMEZONE)
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  const currentValue = field.value
                                    ? toZonedTime(
                                        new Date(field.value),
                                        TIMEZONE
                                      )
                                    : toZonedTime(new Date(), TIMEZONE);
                                  date.setHours(
                                    currentValue.getHours(),
                                    currentValue.getMinutes()
                                  );
                                  field.onChange(
                                    fromZonedTime(date, TIMEZONE).toISOString()
                                  );
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            className="w-[140px]"
                            value={
                              field.value
                                ? formatInTimeZone(
                                    new Date(field.value),
                                    TIMEZONE,
                                    "HH:mm"
                                  )
                                : ""
                            }
                            onChange={(e) => {
                              const [hours, minutes] =
                                e.target.value.split(":");
                              const date = field.value
                                ? toZonedTime(new Date(field.value), TIMEZONE)
                                : toZonedTime(new Date(), TIMEZONE);
                              date.setHours(parseInt(hours), parseInt(minutes));
                              field.onChange(
                                fromZonedTime(date, TIMEZONE).toISOString()
                              );
                            }}
                          />
                          <Clock className="h-4 w-4 opacity-50" />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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

            <FormField
              control={form.control}
              name="formSchemaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Form</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-3xl">
                        <SelectValue placeholder="Select a form schema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formSchemas.map((schema) => (
                        <SelectItem key={schema.id} value={schema.id}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the registration form that attendees will fill out
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <FormLabel>Event Image</FormLabel>
                <FormDescription>
                  Upload an image for your event. Recommended size: 1200x630px
                </FormDescription>
              </div>

              {imageUrl ? (
                <div className="relative w-full max-w-3xl aspect-[1.91/1] rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Event cover"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl(undefined)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full max-w-3xl aspect-[1.91/1] rounded-lg border border-dashed">
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        setImageUrl(res?.[0]?.url);
                        setIsUploading(false);
                        toast({
                          title: "Image uploaded successfully",
                        });
                      }}
                      onUploadError={(error: Error) => {
                        toast({
                          title: "Error uploading image",
                          description: error.message,
                          variant: "destructive",
                        });
                        setIsUploading(false);
                      }}
                      onUploadBegin={() => {
                        setIsUploading(true);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Event
          </Button>
        </div>
      </form>
    </Form>
  );
}
