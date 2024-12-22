"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="hover:text-primary-foreground"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-accent hover:text-primary-foreground dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-accent hover:text-primary-foreground dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("theme.toggleTheme")}</span>
    </Button>
  );
}
