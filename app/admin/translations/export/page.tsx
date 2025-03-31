"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ExportTranslationsPage() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("/api/translations/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to export translations");
      }

      toast({
        title: "Success",
        description: data.message || "Successfully exported translations to JSON files",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export translations",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Export Translations</h1>
      <p className="text-muted-foreground mb-8">
        Export translations from the database to JSON files in the translations folder.
      </p>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Export Translations to JSON</CardTitle>
          <CardDescription>
            This will update all language JSON files based on the current database translations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use this feature to keep your local JSON files in sync with the database.
            This is especially useful for version control or when deploying changes.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export Translations"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 