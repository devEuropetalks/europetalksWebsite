"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { MemberTranslationEditor } from "@/components/translations/MemberTranslationEditor";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function MemberTranslationsPage() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  // Get allowed languages from user metadata
  const allowedLanguages = (user?.publicMetadata?.languages as string || "")
    .split(",")
    .map(lang => lang.trim())
    .filter(Boolean);

  if (!allowedLanguages.length) {
    return (
      <ContentWrapper>
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold mb-8">Translation Management</h1>
          <div className="bg-muted p-4 rounded-lg">
            No languages have been assigned to your account. Please contact an administrator.
          </div>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Translation Management</h1>
        <MemberTranslationEditor allowedLanguages={allowedLanguages} />
      </div>
    </ContentWrapper>
  );
} 