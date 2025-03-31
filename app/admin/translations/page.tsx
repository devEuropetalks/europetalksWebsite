"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { TranslationEditor } from "@/components/translations/TranslationEditor";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function TranslationsPage() {
    const { isSignedIn } = useUser();

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <ContentWrapper>
      <div className="container mx-auto py-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Translation Manager</h1>
          <div className="space-x-4">
            <Link href="/admin/translations/export">
              <span className="text-blue-500 hover:underline">Export to JSON Files</span>
            </Link>
            <Link href="/admin/translations/clean">
              <span className="text-blue-500 hover:underline">Clean Unused Translations</span>
            </Link>
            <Link href="/admin/translations/database">
              <span className="text-blue-500 hover:underline">Database Translations</span>
            </Link>
          </div>
        </div>
        <TranslationEditor />
      </div>
    </ContentWrapper>
  );
} 