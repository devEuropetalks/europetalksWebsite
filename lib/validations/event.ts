import * as z from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
