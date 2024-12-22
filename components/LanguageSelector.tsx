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


export function LanguageSelector() {
  const { t, i18n } = useTranslation("components");

  const languages = [
    { code: "en", name: "English", flag: "/images/languageFlags/en.png" },
    { code: "de", name: "Deutsch", flag: "/images/languageFlags/de.png" },
    { code: "fr", name: "Français", flag: "/images/languageFlags/fr.png" },
    { code: "es", name: "Español", flag: "/images/languageFlags/es.png" },
    { code: "it", name: "Italiano", flag: "/images/languageFlags/it.png" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary-foreground"
        >
          <Globe className="h-5 w-5 text-accent hover:text-primary-foreground" />
          <span className="sr-only">{t("languageSelector.label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="flex items-center gap-2"
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
