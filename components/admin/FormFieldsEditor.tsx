"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldType } from "@/lib/types/event-form";
import type { FormField as CustomFormField } from "@/lib/types/event-form";
import { PlusCircle, Trash2, GripVertical } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { useEffect } from "react";

interface FormFieldsEditorProps {
  value: CustomFormField[];
  onChange: (fields: CustomFormField[]) => void;
}

const FIELD_TYPES: { label: string; value: FormFieldType }[] = [
  { label: "Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "tel" },
  { label: "Date", value: "date" },
  { label: "Textarea", value: "textarea" },
  { label: "Select", value: "select" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
];

export function FormFieldsEditor({ value, onChange }: FormFieldsEditorProps) {
  const form = useForm({
    defaultValues: {
      formFields: value,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    name: "formFields",
    keyName: "id",
    control: form.control,
  });

  // Watch for form changes and update parent after a delay
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        if (value.formFields) {
          const validFields = value.formFields.map(field => {
            const baseField = {
              id: field.id || crypto.randomUUID(),
              type: field.type || "text" as FormFieldType,
              label: field.label || "",
              name: field.name || "",
              required: field.required || false,
              placeholder: field.placeholder,
              description: field.description,
              validation: field.validation
            };

            if (field.type === "select" || field.type === "checkbox" || field.type === "radio") {
              return {
                ...baseField,
                options: (field.options || []).map(opt => ({
                  label: opt.label || opt.value || "",
                  value: opt.value || opt.label || ""
                }))
              };
            }

            return baseField;
          });
          onChange(validFields);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const addField = () => {
    append({
      id: crypto.randomUUID(),
      type: "text",
      label: "",
      name: "",
      required: false,
      placeholder: "",
      description: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel htmlFor="custom-form-fields">Custom Form Fields</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="formFields">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-4"
              id="custom-form-fields"
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <Card
                      className="p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="mt-2 cursor-move"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`formFields.${index}.label`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Label</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Field Label" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`formFields.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Field Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="field_name" />
                                  </FormControl>
                                  <FormDescription>
                                    Use snake_case for field names
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`formFields.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {FIELD_TYPES.map((type) => (
                                        <SelectItem
                                          key={type.value}
                                          value={type.value}
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`formFields.${index}.required`}
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0 pt-8">
                                  <FormLabel>Required</FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={form.control}
                              name={`formFields.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Help text for this field"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`formFields.${index}.placeholder`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Placeholder</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Placeholder text"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {(field.type === "select" ||
                            field.type === "checkbox" ||
                            field.type === "radio") && (
                            <FormField
                              control={form.control}
                              name={`formFields.${index}.options`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Options</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      value={field.value?.map(opt => `${opt.value}|${opt.label}`).join('\n') || ''}
                                      onChange={(e) => {
                                        const options = e.target.value.split('\n')
                                          .filter(line => line.trim())
                                          .map(line => {
                                            const [value, label] = line.split('|');
                                            return { value: value?.trim() || '', label: label?.trim() || value?.trim() || '' };
                                          });
                                        field.onChange(options);
                                      }}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      placeholder="One option per line in format: value|label"
                                      rows={4}
                                      disabled={field.disabled}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Enter one option per line in the format:
                                    value|label
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 