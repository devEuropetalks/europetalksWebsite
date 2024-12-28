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
    // For single-day events, any time is valid
    return true;
  }
  
  const end = new Date(data.endDate);
  // For multi-day events, end date must be after start date
  return end > start;
}, {
  message: "For multi-day events, end date must be after start date.",
  path: ["startDate"],
});

export type EventFormData = z.infer<typeof eventFormSchema>;
