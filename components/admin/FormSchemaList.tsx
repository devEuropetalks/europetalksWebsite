"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FormSchemaDialog } from "@/components/admin/FormSchemaDialog";
import { DeleteDialog } from "@/components/admin/DeleteDialog";

interface FormSchema {
  id: string;
  name: string;
  description?: string;
  fields: Array<{
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
  }>;
  terms: Array<{
    id: string;
    text: string;
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function FormSchemaList() {
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<FormSchema | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSchemas = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/form-schemas");
      if (!response.ok) throw new Error("Failed to fetch schemas");
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error("Error fetching schemas:", error);
      toast({
        title: "Error",
        description: "Failed to load form schemas",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  const handleDelete = async () => {
    if (!selectedSchema) return;

    try {
      const response = await fetch(`/api/admin/form-schemas/${selectedSchema.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete schema");

      toast({
        title: "Success",
        description: "Form schema deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedSchema(null);
      fetchSchemas();
    } catch (error) {
      console.error("Error deleting schema:", error);
      toast({
        title: "Error",
        description: "Failed to delete form schema",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead>Terms</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemas.map((schema) => (
            <TableRow key={schema.id}>
              <TableCell className="font-medium">{schema.name}</TableCell>
              <TableCell>{schema.description}</TableCell>
              <TableCell>{schema.fields.length}</TableCell>
              <TableCell>{schema.terms.length}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedSchema(schema);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedSchema(schema);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <FormSchemaDialog
        schema={selectedSchema || undefined}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedSchema(null);
            fetchSchemas();
          }
        }}
      />

      <DeleteDialog
        title="Delete Form Schema"
        description="Are you sure you want to delete this form schema? This action cannot be undone."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
} 