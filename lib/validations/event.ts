import { z } from "zod";

export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    formSchemaId: z.string().min(1, "Form schema is required"),
    imageUrl: z.string().url().optional(),
    signupPeriodJson: z.object({
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
    }),
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
  )
  .refine(
    (data) => {
      if (!data.signupPeriodJson.endDate) return true;
      const signupEnd = new Date(data.signupPeriodJson.endDate);
      const eventStart = new Date(data.startDate);
      return signupEnd <= eventStart;
    },
    {
      message: "Registration end date must be before or equal to event start date",
      path: ["signupPeriodJson.endDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.signupPeriodJson.startDate || !data.signupPeriodJson.endDate) return true;
      const signupStart = new Date(data.signupPeriodJson.startDate);
      const signupEnd = new Date(data.signupPeriodJson.endDate);
      return signupEnd >= signupStart;
    },
    {
      message: "Registration end date must be after or equal to registration start date",
      path: ["signupPeriodJson.endDate"],
    }
  );

export type EventFormData = z.infer<typeof eventFormSchema>;
