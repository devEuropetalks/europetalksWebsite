"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";

interface TranslationRecord {
  id: string;
  language: string;
  contentSize: number;
}

export default function DatabaseTranslationsPage() {
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dbTranslations, setDbTranslations] = useState<TranslationRecord[]>([]);

  // Security: Redirect to login if not signed in
  if (!isSignedIn) {
    redirect("/sign-in");
  }

  // Check if user is admin
  useEffect(() => {
    if (user && user.publicMetadata.role !== "admin") {
      toast({
        title: "Unauthorized",
        description: "Only admin users can access this page.",
        variant: "destructive",
      });
      redirect("/");
    }
  }, [user, toast]);

  // Fetch database translations on page load
  useEffect(() => {
    const fetchDbTranslations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/translations/db-clean");
        
        if (!response.ok) {
          throw new Error("Failed to fetch database translations");
        }
        
        const data = await response.json();
        if (data.success && data.translations) {
          setDbTranslations(data.translations);
        } else {
          throw new Error(data.error || "No translations found");
        }
      } catch (error) {
        console.error("Error fetching DB translations:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch database translations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDbTranslations();
  }, [toast]);

  // Function to clean all translations in database
  const handleCleanDatabase = async () => {
    if (confirm("Are you sure you want to clean all unused translations from the database? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        // Get the list of unused keys first
        const unusedResponse = await fetch("/api/translations/unused");
        
        if (!unusedResponse.ok) {
          throw new Error("Failed to get unused translations");
        }
        
        const unusedData = await unusedResponse.json();
        const unusedKeys = Object.entries(unusedData).flatMap(
          ([namespace, keys]) => (keys as string[]).map(key => `${namespace}.${key}`)
        );
        
        if (unusedKeys.length === 0) {
          toast({
            title: "No unused keys",
            description: "There are no unused translation keys to clean.",
          });
          return;
        }
        
        // Now clean the database with these keys
        const cleanResponse = await fetch("/api/translations/clean", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unusedKeys,
          }),
        });
        
        const cleanData = await cleanResponse.json();
        
        if (!cleanResponse.ok) {
          throw new Error(cleanData.error || "Failed to clean database");
        }
        
        toast({
          title: "Success",
          description: cleanData.message || "Database translations cleaned successfully",
        });
        
        // Refresh the translation list
        window.location.reload();
      } catch (error) {
        console.error("Error cleaning database:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to clean database",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <ContentWrapper>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Database Translations</h1>
          <Link href="/admin/translations">
            <span className="text-blue-500 hover:underline">&larr; Back to Translation Manager</span>
          </Link>
        </div>
        
        <p className="text-muted-foreground mb-8">
          This page shows the translation records stored in your database.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Database Translation Records</CardTitle>
            <CardDescription>
              {isLoading 
                ? "Loading database translation records..." 
                : `${dbTranslations.length} translation records found in database`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : dbTranslations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No translation records found in the database.
              </p>
            ) : (
              <div className="grid gap-4">
                <div className="grid grid-cols-4 font-semibold border-b pb-2">
                  <div>ID</div>
                  <div>Language</div>
                  <div>Size (bytes)</div>
                  <div>Actions</div>
                </div>
                {dbTranslations.map((translation) => (
                  <div key={translation.id} className="grid grid-cols-4 py-2 border-b">
                    <div className="text-sm font-mono truncate">{translation.id}</div>
                    <div>{translation.language}</div>
                    <div>{translation.contentSize}</div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => toast({
                          title: "Not Implemented",
                          description: "Individual record deletion is not implemented yet",
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleCleanDatabase}
              disabled={isLoading || isDeleting || dbTranslations.length === 0}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning Database...
                </>
              ) : (
                "Clean Unused Translations from Database"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ContentWrapper>
  );
} 