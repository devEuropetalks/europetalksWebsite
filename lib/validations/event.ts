import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Location is required"),
}).refine((data) => {
  const start = new Date(data.startDate);
  if (!data.endDate) {
    // If no end date, start date must include time (not be midnight)
    return start.getHours() !== 0 || start.getMinutes() !== 0;
  }
  const end = new Date(data.endDate);
  // If both dates are provided, end date should be after start date and both should be at midnight
  return end > start && 
         start.getHours() === 0 && 
         start.getMinutes() === 0 &&
         end.getHours() === 0 && 
         end.getMinutes() === 0;
}, {
  message: "For single day events, time must be specified. For multi-day events, end date must be after start date.",
  path: ["startDate"],
});

export type EventFormData = z.infer<typeof eventFormSchema>;
