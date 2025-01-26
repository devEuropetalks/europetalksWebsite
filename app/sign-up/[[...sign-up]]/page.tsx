"use client";

import { SignUp } from "@clerk/nextjs";
import ContentWrapper from "@/components/ContentWrapper";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { i18n } from "@/components/i18n-provider";

export default function SignUpPage() {
  const { t } = useTranslation("auth");

  useEffect(() => {
    // Reload auth translations when the page loads
    i18n.reloadResources(i18n.language, "auth");
  }, []);

  return (
    <ContentWrapper>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            {t("signUp.title")}
          </h1>
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "bg-background border rounded-xl shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "text-foreground",
                formFieldLabel: "text-foreground",
                formFieldInput: "bg-background text-foreground border",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        </div>
      </div>
    </ContentWrapper>
  );
}
