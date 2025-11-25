"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { prefetchLanguage } from "@/components/i18n-provider";

export function LanguageSelector() {
  const { t, i18n } = useTranslation("components");
  const [isChanging, setIsChanging] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: "en", name: "English", flag: "/images/languageFlags/en.png" },
    { code: "de", name: "Deutsch", flag: "/images/languageFlags/de.png" },
    { code: "fr", name: "Français", flag: "/images/languageFlags/fr.png" },
    { code: "es", name: "Español", flag: "/images/languageFlags/es.png" },
    { code: "it", name: "Italiano", flag: "/images/languageFlags/it.png" },
    { code: "nl", name: "Nederlands", flag: "/images/languageFlags/nl.png" },
    { code: "pt", name: "Português", flag: "/images/languageFlags/pt.png" },
    { code: "uk", name: "Українська", flag: "/images/languageFlags/uk.png" },
    { code: "lv", name: "Latviešu", flag: "/images/languageFlags/lv.png" },
    { code: "lt", name: "Lietuvių", flag: "/images/languageFlags/lt.png" },
    { code: "hr", name: "Hrvatski", flag: "/images/languageFlags/hr.png" },
    { code: "hu", name: "Magyar", flag: "/images/languageFlags/hu.png" },
    { code: "el", name: "Greek", flag: "/images/languageFlags/el.png" },
  ];

  const handleLanguageChange = async (langCode: string) => {
    try {
      setIsChanging(true);
      await i18n.changeLanguage(langCode);
      
      toast({
        title: t("languageSelector.success"),
        description: t("languageSelector.languageChanged", {
          language: languages.find(lang => lang.code === langCode)?.name || langCode
        }),
      });
    } catch (error) {
      console.error("Failed to change language:", error);
      toast({
        title: t("languageSelector.error"),
        description: t("languageSelector.errorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  // Prefetch translations on hover for instant language switching
  const handleHover = useCallback((langCode: string) => {
    if (langCode !== i18n.language) {
      prefetchLanguage(langCode);
    }
  }, [i18n.language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary-foreground relative"
          disabled={isChanging}
        >
          {isChanging ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <Globe className="h-5 w-5 text-accent hover:text-primary-foreground" />
          )}
          <span className="sr-only">{t("languageSelector.label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            onMouseEnter={() => handleHover(lang.code)}
            onFocus={() => handleHover(lang.code)}
            className="flex items-center gap-2"
            disabled={isChanging || i18n.language === lang.code}
          >
            <div className="relative w-6 h-4">
              <Image
                src={lang.flag}
                alt={`${lang.name} flag`}
                fill
                className="object-cover rounded-sm"
              />
            </div>
            {lang.name}
            {isChanging && i18n.language === lang.code && (
              <Loader2 className="h-3 w-3 animate-spin ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
