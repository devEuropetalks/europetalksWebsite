"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ContentWrapper from "@/components/ContentWrapper";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

export default function CleanTranslationsPage() {
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [unusedKeys, setUnusedKeys] = useState<string[]>([]);
  const [unusedByNamespace, setUnusedByNamespace] = useState<Record<string, string[]>>({});
  const [expandedNamespaces, setExpandedNamespaces] = useState<Record<string, boolean>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Schütze die Seite vor unbefugtem Zugriff
  if (!isSignedIn) {
    redirect("/sign-in");
  }

  // Prüfe, ob der Benutzer Admin ist
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

  // Analysiere unbenutzte Übersetzungen
  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setUnusedKeys([]);
      setUnusedByNamespace({});

      // Dies ist nur ein Mock für das Frontend, die tatsächliche Analyse erfolgt serverseitig
      // mit dem Node.js-Script clean-translations.js
      toast({
        title: "Analyzing translations",
        description: "This may take a moment...",
      });

      // In einer realen Implementierung würdest du einen API-Endpunkt aufrufen
      // Hier simulieren wir das Laden einer JSON-Datei
      setTimeout(async () => {
        try {
          const response = await fetch("/api/translations/unused", {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
            },
          }).catch(error => {
            console.error("Network error:", error);
            throw new Error("Network error: Could not connect to API");
          });
          
          // Check for headers that might indicate using mock data
          const isUsingMock = response.headers.get('X-Warning')?.includes('mock data');
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(errorData.error || "Failed to analyze translations");
          }
          
          const data = await response.json().catch(() => {
            throw new Error("Invalid response format");
          });
          
          // Add a warning toast if we're using mock data
          if (isUsingMock) {
            toast({
              title: "Using Sample Data",
              description: "For production use, run the script: 'node scripts/clean-translations.js'"
            });
          }
          
          // Organisiere die Ergebnisse nach Namespace
          const byNamespace: Record<string, string[]> = {};
          const allKeys: string[] = [];
          
          Object.entries(data).forEach(([namespace, keys]) => {
            byNamespace[namespace] = keys as string[];
            (keys as string[]).forEach(key => {
              allKeys.push(`${namespace}.${key}`);
            });
          });
          
          setUnusedKeys(allKeys);
          setUnusedByNamespace(byNamespace);
          
          // Expandiere standardmäßig alle Namespaces
          const expanded: Record<string, boolean> = {};
          Object.keys(byNamespace).forEach(ns => {
            expanded[ns] = true;
          });
          setExpandedNamespaces(expanded);
          
          toast({
            title: "Analysis Complete",
            description: `Found ${allKeys.length} unused translation keys`,
          });
        } catch (error) {
          console.error("Analysis error:", error);
          let errorMessage = "Failed to analyze translations. Please try again.";
          
          // Handle specific error types
          if (error instanceof Error) {
            if (error.message.includes("Network error")) {
              errorMessage = "Network error: Could not connect to the server. Check your connection.";
            } else if (error.message.includes("Invalid response")) {
              errorMessage = "Server returned an invalid response format.";
            } else {
              errorMessage = error.message;
            }
          }
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      }, 1500);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze translations. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  // Show confirmation dialog before cleaning
  const handleCleanConfirm = () => {
    if (unusedKeys.length === 0) {
      toast({
        title: "No unused keys",
        description: "There are no unused translation keys to clean.",
      });
      return;
    }
    
    setShowConfirmation(true);
  };

  // Actually clean translations after confirmation
  const handleClean = async () => {
    try {
      setIsCleaning(true);
      setShowConfirmation(false);
      
      const response = await fetch("/api/translations/clean", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unusedKeys,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clean translations");
      }

      toast({
        title: "Success",
        description: data.message || "Successfully cleaned unused translations",
      });
      
      // Zurücksetzen nach erfolgreicher Bereinigung
      setUnusedKeys([]);
      setUnusedByNamespace({});
      
    } catch (error) {
      console.error("Clean error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clean translations",
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  // Toggle für die Namespace-Expansion
  const toggleNamespace = (namespace: string) => {
    setExpandedNamespaces(prev => ({
      ...prev,
      [namespace]: !prev[namespace]
    }));
  };

  return (
    <ContentWrapper>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clean Unused Translations</h1>
          <Link href="/admin/translations">
            <span className="text-blue-500 hover:underline">&larr; Back to Translation Manager</span>
          </Link>
        </div>
        
        <p className="text-muted-foreground mb-8">
          This tool helps you identify and remove translation keys that are not used in your application.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Analyze</CardTitle>
              <CardDescription>
                Scan the codebase to identify unused translation keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The analysis process scans your code for translation function calls
                and compares them with all available translation keys.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Start Analysis"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Clean</CardTitle>
              <CardDescription>
                Remove unused translation keys from JSON files and database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This action will remove all identified unused translation keys from both
                your JSON files and database. This operation cannot be undone.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCleanConfirm} 
                disabled={isCleaning || unusedKeys.length === 0}
                variant={unusedKeys.length > 0 ? "destructive" : "outline"}
              >
                {isCleaning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  `Clean ${unusedKeys.length > 0 ? unusedKeys.length : ''} Unused Keys`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Ergebnisse der Analyse */}
        {Object.keys(unusedByNamespace).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Found {unusedKeys.length} unused translation keys across {Object.keys(unusedByNamespace).length} namespaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(unusedByNamespace).map(([namespace, keys]) => (
                  <div key={namespace} className="border rounded-md p-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleNamespace(namespace)}
                    >
                      <h3 className="text-lg font-medium">{namespace}</h3>
                      <div className="flex items-center">
                        <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full mr-2">
                          {keys.length} keys
                        </span>
                        <span>{expandedNamespaces[namespace] ? '▼' : '►'}</span>
                      </div>
                    </div>
                    
                    {expandedNamespaces[namespace] && (
                      <div className="mt-4 pl-4 border-l-2 border-muted space-y-1 max-h-60 overflow-y-auto">
                        {keys.map(key => (
                          <div key={key} className="text-sm font-mono">
                            {key}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-3xl">
            <DialogHeader className="flex flex-col items-center gap-2">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-center">
                You are about to delete <span className="font-semibold">{unusedKeys.length}</span> translation keys from all languages and JSON files.<br />
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {/* Summary section */}
            <div className="mt-4 mb-2 p-4 bg-muted/50 rounded-md">
              <h3 className="text-base font-semibold mb-2">Summary</h3>
              <p className="text-sm mb-2">
                {Object.keys(unusedByNamespace).length} namespaces affected:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(unusedByNamespace).map(([namespace, keys]) => (
                  <div key={namespace} className="px-2 py-1 bg-muted rounded-md text-xs">
                    {namespace}: {keys.length} keys
                  </div>
                ))}
              </div>
            </div>
            
            <ScrollArea className="mt-4 h-[40vh] pr-4 border rounded-md">
              <div className="space-y-4 p-4">
                {Object.entries(unusedByNamespace).map(([namespace, keys]) => (
                  <div key={namespace} className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{namespace}</h3>
                      <div className="flex items-center">
                        <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                          {keys.length} keys
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pl-4 border-l-2 border-muted space-y-1">
                      {keys.map(key => (
                        <div key={key} className="text-sm font-mono text-destructive">
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <DialogFooter className="mt-6 space-x-4 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isCleaning}
                className="sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClean}
                disabled={isCleaning}
                className="sm:order-2"
              >
                {isCleaning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Deletion"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ContentWrapper>
  );
} 