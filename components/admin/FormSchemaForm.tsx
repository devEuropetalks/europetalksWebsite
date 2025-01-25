"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormFieldsEditor } from "./FormFieldsEditor";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

const formSchemaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      name: z.string(),
      required: z.boolean(),
      placeholder: z.string().optional(),
      description: z.string().optional(),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        )
        .optional(),
      validation: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          pattern: z.string().optional(),
          customMessage: z.string().optional(),
        })
        .optional(),
      order: z.number(),
    })
  ),
  terms: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      order: z.number(),
    })
  ),
});

type FormSchemaData = z.infer<typeof formSchemaSchema>;

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

interface FormSchemaFormProps {
  defaultValues?: {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
    terms: EventTerm[];
  };
  onSuccess?: () => void;
}

export function FormSchemaForm({
  defaultValues,
  onSuccess,
}: FormSchemaFormProps) {
  const { toast } = useToast();
  const form = useForm<FormSchemaData>({
    resolver: zodResolver(formSchemaSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      fields: defaultValues?.fields || [],
      terms: defaultValues?.terms || [],
    },
  });

  const onSubmit = async (data: FormSchemaData) => {
    try {
      const url = defaultValues?.id
        ? `/api/admin/form-schemas/${defaultValues.id}`
        : "/api/admin/form-schemas";
      const method = defaultValues?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save form schema");

      toast({
        title: "Success",
        description: `Form schema ${
          defaultValues?.id ? "updated" : "created"
        } successfully`,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error saving form schema:", error);
      toast({
        title: "Error",
        description: "Failed to save form schema",
        variant: "destructive",
      });
    }
  };

  const addTerm = () => {
    const currentTerms = form.getValues("terms");
    form.setValue("terms", [
      ...currentTerms,
      {
        id: crypto.randomUUID(),
        text: "",
        order: currentTerms.length,
      },
    ]);
  };

  const removeTerm = (index: number) => {
    const currentTerms = form.getValues("terms");
    form.setValue(
      "terms",
      currentTerms.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter schema name" />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this form schema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter schema description"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of what this schema is used for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6 pt-6 border-t">
              <FormFieldsEditor
                value={form.watch("fields") as unknown as FormField[]}
                onChange={(fields) => form.setValue("fields", fields)}
              />
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Terms and Conditions</h3>
                  <Button type="button" variant="outline" onClick={addTerm}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Term
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.watch("terms").map((term, index) => (
                    <Card key={term.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`terms.${index}.text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Term Text</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Enter the term text that users must agree to"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTerm(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {defaultValues?.id ? "Update Schema" : "Create Schema"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
