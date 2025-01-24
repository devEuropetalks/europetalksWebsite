"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { Card } from "@/components/ui/card";
import { CalendarDays, Languages, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const adminLinks = [
  {
    title: "Manage Events",
    description: "Create, edit, and delete events",
    href: "/admin/manage-events",
    icon: CalendarDays,
  },
  {
    title: "Manage Translations",
    description: "Manage site translations",
    href: "/admin/translations",
    icon: Languages,
  },
  {
    title: "Manage Form Schemas",
    description: "Create and edit signup form templates",
    href: "/admin/form-schemas",
    icon: ClipboardList,
  },
  {
    title: "Manage Signups",
    description: "View and manage event registrations",
    href: "/admin/signups",
    icon: Users,
  },
];

export default function AdminPage() {
  const { t } = useTranslation("admin");
  
  return (
    <ContentWrapper>
      <div className="container py-8 mt-8">
        <h1 className="text-4xl font-bold mb-8">{t("dashboard.title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <Icon className="h-6 w-6 mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold">{link.title}</h2>
                      <p className="text-muted-foreground mt-1">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </ContentWrapper>
  );
} 