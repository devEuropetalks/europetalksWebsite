"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { initialTranslations } from "@/translations/initial-translations";
import { TranslationObject } from "@/types/translations";

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

  const englishTranslations = initialTranslations.en[namespace];

  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'en') {
        setTranslations(englishTranslations);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/translations?language=${language}&namespace=${namespace}`
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to load translations" }));
          throw new Error(errorData.error || "Failed to load translations");
        }
        
        const data = await response.json();
        
        if (data && typeof data === 'object') {
          setTranslations(data);
        } else {
          console.warn(`Invalid translation data received for ${language}/${namespace}`);
          setTranslations({});
        }
      } catch (error) {
        console.error("Error loading translations:", error);
        setError(error instanceof Error ? error.message : "Failed to load translations");
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language, namespace, englishTranslations]);

  const handleInputChange = (path: string[], value: string) => {
    setTranslations((prev) => {
      const newTranslations = { ...prev };
      let current: TranslationObject = newTranslations;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]] as TranslationObject;
      }
      current[path[path.length - 1]] = value;
      
      return newTranslations;
    });
  };

  const renderTranslationPair = (
    obj: TranslationObject,
    translatedObj: TranslationObject,
    path: string[] = []
  ): JSX.Element[] => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      
      if (value && typeof value === "object") {
        return (
          <div key={currentPath.join('.')} className="ml-4 w-full">
            <h3 className="font-semibold mt-4 mb-2">{key}</h3>
            <div className="space-y-2">
              {renderTranslationPair(
                value as TranslationObject,
                (translatedObj?.[key] as TranslationObject) || {},
                currentPath
              )}
            </div>
          </div>
        );
      }

      const translatedValue = translatedObj?.[key] as string || '';
      const pathString = currentPath.join(' → ');

      return (
        <div key={currentPath.join('.')} className="flex gap-4 items-center my-2">
          <div className="w-1/2 flex gap-4">
            <label className="w-48 text-sm font-medium">{key}:</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1 text-muted-foreground cursor-help">
                    {value as string}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Path: {pathString}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-1/2">
            <Input
              value={translatedValue}
              onChange={(e) => handleInputChange(currentPath, e.target.value)}
              className="w-full"
              placeholder={`Enter ${key} translation`}
              disabled={language === 'en'}
            />
          </div>
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
        <div className="flex justify-between mb-4 border-b pb-2">
          <div className="w-1/2 font-semibold">English Text</div>
          <div className="w-1/2 font-semibold">
            {language === 'en' ? 'English Text' : 'Translated Text'}
          </div>
        </div>
        {renderTranslationPair(englishTranslations, translations)}
      </div>
      <Button 
        onClick={() => onSave(translations)} 
        disabled={isSaving || language === 'en'}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
} 