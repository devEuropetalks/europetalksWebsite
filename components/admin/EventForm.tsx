"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface EventFormProps {
  onSubmit: (data: EventFormData & { imageUrl?: string }) => void;
  defaultValues?: EventFormData & { imageUrl?: string };
}

export function EventForm({ onSubmit, defaultValues }: EventFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(defaultValues?.imageUrl);
  const [isMultiDay, setIsMultiDay] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      startDate: defaultValues?.startDate || "",
      endDate: defaultValues?.endDate || "",
      location: defaultValues?.location || "",
    },
  });

  const handleSubmit = async (values: EventFormData) => {
    onSubmit({
      ...values,
      imageUrl: imageUrl,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <Switch
            checked={isMultiDay}
            onCheckedChange={setIsMultiDay}
            id="multi-day"
          />
          <label htmlFor="multi-day" className="text-sm font-medium">
            Multi-day event
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), isMultiDay ? "PPP" : "PPP p")
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          if (isMultiDay) {
                            // For multi-day events, set time to midnight
                            date.setHours(0, 0, 0, 0);
                          } else {
                            // For single-day events, default to current time if not set
                            const currentDate = new Date();
                            date.setHours(currentDate.getHours(), currentDate.getMinutes());
                          }
                          field.onChange(date.toISOString());
                        }
                      }}
                      initialFocus
                      showOutsideDays={false}
                      fromYear={2018}
                      toYear={2038}
                    />
                    {!isMultiDay && (
                      <div className="p-3 border-t flex items-center gap-2">
                        <Clock className="h-4 w-4 opacity-50" />
                        <input
                          type="time"
                          className="w-full min-w-[150px]"
                          onChange={(e) => {
                            const date = field.value ? new Date(field.value) : new Date();
                            const [hours, minutes] = e.target.value.split(':');
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(date.toISOString());
                          }}
                          value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
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
                            "pl-3 text-left font-normal",
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
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            date.setHours(0, 0, 0, 0);
                            field.onChange(date.toISOString());
                          }
                        }}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate");
                          return startDate && date <= new Date(startDate);
                        }}
                        initialFocus
                        showOutsideDays={false}
                        fromYear={2018}
                        toYear={2038}
                      />
                    </PopoverContent>
                  </Popover>
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Thumbnail Image</FormLabel>
          <div className="flex items-center gap-4">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setImageUrl(res[0].url);
                }
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
            {imageUrl && (
              <div className="relative w-16 h-16">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  className="object-cover rounded-md"
                  fill
                />
              </div>
            )}
          </div>
        </div>

        <Button type="submit">Save Event</Button>
      </form>
    </Form>
  );
}
