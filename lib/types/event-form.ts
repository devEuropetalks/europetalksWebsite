import { z } from "zod";

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface BaseFormField {
  type: FormFieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
}

export interface EventTerms {
  id: string;
  text: string;
}

export interface EventFormConfig {
  fields: FormField[];
  terms: EventTerms[];
}

export type EventTermsInput = Required<Pick<EventTerms, 'id'>> & Partial<Omit<EventTerms, 'id'>>;

export interface PartialFormField {
  id: string;
  type?: FormFieldType;
  label?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
}

export interface PartialEventTerms {
  id: string;
  text?: string;
}

export interface PartialEventFormConfig {
  fields?: PartialFormField[];
  terms?: PartialEventTerms[];
}

// Helper function to create a dynamic Zod schema based on form fields
export function createDynamicSchema(
  formFields: FormField[],
  terms: EventTerms[]
) {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    // Always include basic fields
    fullName: z
      .string()
      .min(3, "Full name is required and must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    termsAgreement: terms.length > 0 
      ? z.array(z.string()).refine(
          (value) => value.length === terms.length,
          "You must agree to all terms and conditions"
        )
      : z.array(z.string()).optional(),
  };

  formFields.forEach((field) => {
    let fieldSchema:
      | z.ZodString
      | z.ZodArray<z.ZodString>
      | z.ZodEffects<z.ZodString>;

    switch (field.type) {
      case "email":
        fieldSchema = z
          .string()
          .email(
            field.validation?.customMessage || "Please enter a valid email"
          );
        break;
      case "tel":
        fieldSchema = z
          .string()
          .regex(
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            field.validation?.customMessage ||
              "Please enter a valid phone number"
          );
        break;
      case "date":
        fieldSchema = z.string().refine((value) => {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }, field.validation?.customMessage || "Please enter a valid date");
        break;
      case "textarea":
      case "text":
      case "radio":
        fieldSchema = z.string();
        if (field.validation?.min) {
          fieldSchema = fieldSchema.min(
            field.validation.min,
            field.validation?.customMessage ||
              `Minimum ${field.validation.min} characters required`
          );
        }
        break;
      case "checkbox":
        fieldSchema = z
          .array(z.string())
          .min(1, "Please select at least one option");
        break;
      default:
        fieldSchema = z.string();
    }

    schemaFields[field.name] = field.required
      ? fieldSchema
      : fieldSchema.optional();
  });

  return z.object(schemaFields);
}
