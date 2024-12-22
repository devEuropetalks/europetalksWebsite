"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

interface TranslationTreeProps {
  language: string;
  namespace: string;
  onSave: (translations: TranslationObject) => void;
  isSaving?: boolean;
}

export function TranslationTree({ language, namespace, onSave, isSaving }: TranslationTreeProps) {
  const [translations, setTranslations] = useState<TranslationObject>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/translations?language=${language}&namespace=${namespace}`
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load translations");
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Error loading translations:", error);
        setError(error instanceof Error ? error.message : "Failed to load translations");
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language, namespace]);

  const handleInputChange = (path: string[], value: string) => {
    setTranslations((prev) => {
      const newTranslations = { ...prev };
      let current: TranslationObject = newTranslations;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] as TranslationObject;
      }
      current[path[path.length - 1]] = value;
      
      return newTranslations;
    });
  };

  const renderTranslationTree = (
    obj: TranslationObject,
    path: string[] = []
  ): JSX.Element[] => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      
      if (typeof value === "object") {
        return (
          <div key={key} className="ml-4">
            <h3 className="font-semibold mt-4 mb-2">{key}</h3>
            {renderTranslationTree(value, currentPath)}
          </div>
        );
      }

      return (
        <div key={key} className="flex gap-4 items-center my-2">
          <label className="w-48 text-sm">{key}:</label>
          <Input
            value={value}
            onChange={(e) => handleInputChange(currentPath, e.target.value)}
            className="flex-1"
          />
        </div>
      );
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading translations...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        {renderTranslationTree(translations)}
      </div>
      <Button onClick={() => onSave(translations)} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
} 