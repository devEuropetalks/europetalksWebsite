"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { FormSchemaDialog } from "@/components/admin/FormSchemaDialog";
import { FormSchemaList } from "@/components/admin/FormSchemaList";

export default function FormSchemasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <ContentWrapper>
      <div className="container py-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Form Schemas</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Schema
          </Button>
        </div>

        <Card className="p-6">
          <FormSchemaList />
        </Card>

        <FormSchemaDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </ContentWrapper>
  );
} 