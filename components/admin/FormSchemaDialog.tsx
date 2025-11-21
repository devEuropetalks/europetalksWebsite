"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSchemaForm } from "./FormSchemaForm";

type FormField = {
  id: string;
  type: string;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  order: number;
};

type EventTerm = {
  id: string;
  text: string;
  order: number;
};

interface FormSchemaDialogProps {
  schema?: {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
    terms: EventTerm[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormSchemaDialog({
  schema,
  open,
  onOpenChange,
}: FormSchemaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {schema ? "Edit Form Schema" : "Create Form Schema"}
          </DialogTitle>
        </DialogHeader>
        <FormSchemaForm
          defaultValues={schema}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
