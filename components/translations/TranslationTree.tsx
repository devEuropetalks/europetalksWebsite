"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { initialTranslations } from "@/translations/initial-translations";
import { TranslationObject } from "@/types/translations";

// Constants
const TEXT_LENGTH_THRESHOLD = 50; // Use textarea for text longer than this

interface TranslationTreeProps {
  language: string;
  namespace: string;
  onSave: (translations: TranslationObject) => void;
  isSaving?: boolean;
}

// Component for rendering a single translation pair
function TranslationPairItem({ 
  keyName, 
  value, 
  translatedValue, 
  path, 
  disabled, 
  onChange 
}: { 
  keyName: string;
  value: string | object | number | boolean;
  translatedValue: string;
  path: string[];
  disabled: boolean;
  onChange: (path: string[], value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathString = path.join(' → ');
  
  // Skip if it's not a primitive value we can display
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return null;
  
  // Convert to string if it's a number or boolean
  const stringValue = typeof value === 'string' ? value : String(value);
  
  const isLongText = stringValue.length > TEXT_LENGTH_THRESHOLD || translatedValue.length > TEXT_LENGTH_THRESHOLD;
  const isVeryLongText = stringValue.length > TEXT_LENGTH_THRESHOLD * 3;
  
  // Format the display value for long text
  let displayValue = stringValue;
  if (isVeryLongText && !isExpanded) {
    displayValue = stringValue.substring(0, TEXT_LENGTH_THRESHOLD) + '...';
  }

  return (
    <div className={`flex gap-4 ${isLongText ? 'flex-col' : 'items-center'} my-4 pb-4 ${isLongText ? 'border-b' : ''}`}>
      <div className={`${isLongText ? 'w-full' : 'w-1/2'} flex gap-4`}>
        <label className="w-48 text-sm font-medium">{keyName}:</label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${isLongText ? 'w-full' : 'flex-1'} text-muted-foreground cursor-help`}>
                {isLongText ? (
                  <div className="whitespace-pre-wrap">
                    {displayValue}
                    {isVeryLongText && (
                      <button 
                        className="ml-2 text-xs text-blue-500 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsExpanded(!isExpanded);
                        }}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                ) : (
                  stringValue
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Path: {pathString}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={isLongText ? 'w-full mt-2' : 'w-1/2'}>
        {isLongText ? (
          <Textarea
            value={translatedValue}
            onChange={(e) => onChange(path, e.target.value)}
            className="w-full min-h-[100px] resize-y"
            placeholder={`Enter ${keyName} translation`}
            disabled={disabled}
          />
        ) : (
          <Input
            value={translatedValue}
            onChange={(e) => onChange(path, e.target.value)}
            className="w-full"
            placeholder={`Enter ${keyName} translation`}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
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

      return (
        <TranslationPairItem
          key={currentPath.join('.')}
          keyName={key}
          value={value}
          translatedValue={translatedValue}
          path={currentPath}
          disabled={language === 'en'}
          onChange={handleInputChange}
        />
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