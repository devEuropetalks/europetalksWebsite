import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Location is required"),
}).refine((data) => {
  // If no end date is provided, it's valid (single-day event)
  if (!data.endDate) return true;
  
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  
  // For multi-day events, end date must be after or equal to start date
  return end >= start;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export type EventFormData = z.infer<typeof eventFormSchema>;
