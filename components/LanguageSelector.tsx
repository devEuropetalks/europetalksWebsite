"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useState } from "react";

export function LanguageSelector() {
  const { t, i18n } = useTranslation("components");
  const [isChanging, setIsChanging] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "/images/languageFlags/en.png" },
    { code: "de", name: "Deutsch", flag: "/images/languageFlags/de.png" },
    { code: "fr", name: "Français", flag: "/images/languageFlags/fr.png" },
    { code: "es", name: "Español", flag: "/images/languageFlags/es.png" },
    { code: "it", name: "Italiano", flag: "/images/languageFlags/it.png" },
  ];

  const handleLanguageChange = async (langCode: string) => {
    try {
      setIsChanging(true);
      await i18n.changeLanguage(langCode);
    } catch (error) {
      console.error("Failed to change language:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary-foreground"
          disabled={isChanging}
        >
          <Globe className="h-5 w-5 text-accent hover:text-primary-foreground" />
          <span className="sr-only">{t("languageSelector.label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
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
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
