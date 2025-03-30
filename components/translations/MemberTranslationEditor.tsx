"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TranslationTree } from "./TranslationTree";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { i18n } from "@/components/i18n-provider";

interface MemberTranslationEditorProps {
  allowedLanguages: string[];
}

export function MemberTranslationEditor({
  allowedLanguages,
}: MemberTranslationEditorProps) {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState(allowedLanguages[0]);
  const [selectedNamespace, setSelectedNamespace] = useState("home");
  const [isSaving, setIsSaving] = useState(false);

  // Map language codes to their full names
  const languageNames = {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    nl: "Nederlands",
    pt: "Português",
    uk: "Українська",
    lv: "Latviešu",
    hr: "Hrvatski",
    hu: "Magyar",
    el: "Greek",
  } as const;

  const namespaces = [
    "home",
    "about",
    "contact",
    "events",
    "gallery",
    "header",
    "components",
    "auth",
    "other",
  ];

  const handleSave = async (translations: Record<string, unknown>) => {
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
        throw new Error("Failed to save translations");
      }

      // Reload i18n resources after saving
      await i18n.reloadResources(selectedLanguage, selectedNamespace);

      toast({
        title: "Success",
        description: "Translations saved successfully",
      });
    } catch (error) {
      console.error("Translation save error:", error);
      toast({
        title: "Error",
        description: "Failed to save translations",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Language</label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {languageNames[lang as keyof typeof languageNames] || lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Section</label>
          <Select
            value={selectedNamespace}
            onValueChange={setSelectedNamespace}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {namespaces.map((namespace) => (
                <SelectItem key={namespace} value={namespace}>
                  {namespace.charAt(0).toUpperCase() + namespace.slice(1)}
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
