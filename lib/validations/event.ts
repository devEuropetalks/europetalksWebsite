import { z } from "zod";

const formFieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "text",
    "email",
    "tel",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "date",
  ] as const),
  label: z.string(),
  name: z.string(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  options: z.array(formFieldOptionSchema).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    customMessage: z.string().optional(),
  }).optional(),
});

const termSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().url().optional(),
  formFields: z
    .object({
      fields: z.array(formFieldSchema),
      terms: z.array(termSchema),
    })
    .optional()
    .default({ fields: [], terms: [] }),
  signupPeriodJson: z
    .object({
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
    })
    .optional()
    .default({ startDate: null, endDate: null }),
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

export type FormFieldOption = z.infer<typeof formFieldOptionSchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type EventTerm = z.infer<typeof termSchema>;
export type EventFormConfig = {
  fields: FormField[];
  terms: EventTerm[];
};
export type EventFormData = z.infer<typeof eventFormSchema>;
