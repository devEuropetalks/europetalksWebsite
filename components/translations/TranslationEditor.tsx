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
import { i18n } from "@/components/i18n-provider";
import { TranslationObject } from "@/types/translations";

export function TranslationEditor() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedNamespace, setSelectedNamespace] = useState("home");
  const [isSaving, setIsSaving] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "it", name: "Italiano" },
    { code: "nl", name: "Nederlands" },
    { code: "pt", name: "Português" },
    { code: "uk", name: "Українська" },
    { code: "lv", name: "Latviešu" },
    { code: "hr", name: "Hrvatski" },
    { code: "hu", name: "Magyar" },
    { code: "el", name: "Greek" },
  ];

  const namespaces = [
    "home", 
    "about", 
    "contact", 
    "events", 
    "gallery", 
    "header", 
    "components",
    "auth",
    "other"
  ];

  const handleSave = async (translations: TranslationObject) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/translations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          namespace: selectedNamespace,
          translations,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save translations");
      }

      await i18n.reloadResources(selectedLanguage, selectedNamespace);

      toast({
        title: "Success",
        description: "Translations saved successfully",
      });
    } catch (error: unknown) {
      console.error("Translation save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save translations",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        isSaving={isSaving}
      />
    </div>
  );
} 