"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Trash2 } from "lucide-react";

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

interface FormFieldsEditorProps {
  value: FormField[];
  onChange: (fields: FormField[]) => void;
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "date", label: "Date" },
];

export function FormFieldsEditor({ value, onChange }: FormFieldsEditorProps) {
  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: "text",
      label: "",
      name: "",
      required: false,
      placeholder: "",
      description: "",
      options: [],
      validation: {},
      order: value.length,
    };
    onChange([...value, newField]);
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    const newFields = [...value];
    newFields[index] = { ...newFields[index], ...field };
    onChange(newFields);
  };

  const removeField = (index: number) => {
    const newFields = value.filter((_, i) => i !== index);
    onChange(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Form Fields</h3>
        <Button type="button" variant="outline" onClick={addField}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="space-y-4">
        {value.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateField(index, { type: value })
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FormLabel>Label</FormLabel>
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, { label: e.target.value })
                      }
                      placeholder="Field label"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Name</FormLabel>
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, { name: e.target.value })
                      }
                      placeholder="Field name"
                    />
                  </div>

                  <div>
                    <FormLabel>Placeholder</FormLabel>
                    <Input
                      value={field.placeholder}
                      onChange={(e) =>
                        updateField(index, { placeholder: e.target.value })
                      }
                      placeholder="Field placeholder"
                    />
                  </div>
                </div>

                <div>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={field.description}
                    onChange={(e) =>
                      updateField(index, { description: e.target.value })
                    }
                    placeholder="Field description"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateField(index, { required: checked })
                    }
                  />
                  <label className="text-sm font-medium">Required field</label>
                </div>

                {(field.type === "select" || field.type === "radio") && (
                  <div>
                    <FormLabel>Options</FormLabel>
                    <div className="space-y-2">
                      {(field.options || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            value={option.label}
                            onChange={(e) => {
                              const newOptions = [...(field.options || [])];
                              newOptions[optionIndex] = {
                                ...newOptions[optionIndex],
                                label: e.target.value,
                                value: e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-"),
                              };
                              updateField(index, { options: newOptions });
                            }}
                            placeholder="Option label"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newOptions = (field.options || []).filter(
                                (_, i) => i !== optionIndex
                              );
                              updateField(index, { options: newOptions });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [
                            ...(field.options || []),
                            { label: "", value: "" },
                          ];
                          updateField(index, { options: newOptions });
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
