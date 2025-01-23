import { z } from "zod";

export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    terms: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
        })
      )
      .optional(),
    signupPeriodJson: z.object({
      startDate: z.string().optional(), // If not set, defaults to creation time
      endDate: z.string().optional(), // If not set, defaults to event start time
    }),
  })
  .refine(
    (data) => {
      // If no end date is provided, it's valid (single-day event)
      if (!data.endDate) return true;

      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      // For multi-day events, end date must be after or equal to start date
      return end >= start;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.signupPeriodJson.endDate) return true;
      const signupEnd = new Date(data.signupPeriodJson.endDate);
      const eventStart = new Date(data.startDate);
      return signupEnd <= eventStart;
    },
    {
      message: "Signup end date must be before or equal to event start date",
      path: ["signupPeriodJson.endDate"],
    }
  );

export type EventFormData = z.infer<typeof eventFormSchema>;
