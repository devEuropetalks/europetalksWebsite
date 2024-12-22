"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TranslationTree } from "@/components/translations/TranslationTree";

export function TranslationEditor() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedNamespace, setSelectedNamespace] = useState("home");

  const languages = [
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "it", name: "Italiano" },
  ];

  const namespaces = ["home", "about", "contact", "events", "gallery", "header", "components"];

  const handleSave = async (translations: Record<string, string>) => {
    try {
      const response = await fetch("/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          namespace: selectedNamespace,
          translations,
        }),
      });

      if (!response.ok) throw new Error("Failed to save translations");

      toast({
        title: "Success",
        description: "Translations saved successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save translations",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="w-48">
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={selectedNamespace}
            onValueChange={setSelectedNamespace}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select namespace" />
            </SelectTrigger>
            <SelectContent>
              {namespaces.map((ns) => (
                <SelectItem key={ns} value={ns}>
                  {ns}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TranslationTree
        language={selectedLanguage}
        namespace={selectedNamespace}
        onSave={handleSave}
      />
    </div>
  );
} 