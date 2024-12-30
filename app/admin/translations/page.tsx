"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { TranslationEditor } from "@/components/translations/TranslationEditor";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function TranslationsPage() {
    const { isSignedIn } = useUser();

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <ContentWrapper>
      <div className="container mx-auto py-8 mt-8">
        <h1 className="text-4xl font-bold mb-8">Translation Management</h1>
        <TranslationEditor />
      </div>
    </ContentWrapper>
  );
} 