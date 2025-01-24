import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required"),
  formSchemaId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  signupPeriodJson: z.object({
    startDate: z.string().nullable(),
    endDate: z.string().nullable()
  })
})
.refine(
  (data) => {
    if (!data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

export type EventFormData = z.infer<typeof eventFormSchema>;
