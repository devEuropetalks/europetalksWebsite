"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin");
  
  return (
    <ContentWrapper>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">{t("dashboard.title")}</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Button asChild size="lg" className="h-32">
            <Link href="/admin/manage-events">
              {t("dashboard.manageEvents")}
            </Link>
          </Button>
          
          <Button asChild size="lg" className="h-32">
            <Link href="/admin/translations">
              {t("dashboard.manageTranslations")}
            </Link>
          </Button>
        </div>
      </div>
    </ContentWrapper>
  );
} 