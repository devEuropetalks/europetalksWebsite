import { z } from "zod";

export type FormFieldType = "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: FormFieldOption[];  // For select, checkbox, radio
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
}

export interface EventFormConfig {
  fields: FormField[];
}

// Helper function to create a dynamic Zod schema based on form fields
export function createDynamicSchema(formFields: FormField[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    // Always include basic fields
    fullName: z.string().min(3, "Full name is required and must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
  };

  formFields.forEach((field) => {
    let fieldSchema: z.ZodString | z.ZodArray<z.ZodString>;

    switch (field.type) {
      case "email":
        fieldSchema = z.string().email(field.validation?.customMessage || "Please enter a valid email");
        break;
      case "tel":
        fieldSchema = z.string().regex(
          /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
          field.validation?.customMessage || "Please enter a valid phone number"
        );
        break;
      case "textarea":
      case "text":
      case "radio":
        fieldSchema = z.string();
        if (field.validation?.min) {
          fieldSchema = fieldSchema.min(
            field.validation.min,
            field.validation?.customMessage || `Minimum ${field.validation.min} characters required`
          );
        }
        break;
      case "checkbox":
        fieldSchema = z.array(z.string()).min(1, "Please select at least one option");
        break;
      default:
        fieldSchema = z.string();
    }

    schemaFields[field.name] = field.required ? fieldSchema : fieldSchema.optional();
  });

  return z.object(schemaFields);
} 