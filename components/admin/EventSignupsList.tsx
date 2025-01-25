"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EventSignup {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  formData: Record<string, string>;
  createdAt: string;
}

interface EventSignupsListProps {
  eventId: string;
  eventTitle: string;
  formFields: Array<{
    id: string;
    label: string;
    name: string;
    type: string;
  }>;
  terms?: Array<{
    id: string;
    text: string;
    order: number;
  }>;
}

export function EventSignupsList({
  eventId,
  eventTitle,
  formFields,
  terms,
}: EventSignupsListProps) {
  const [signups, setSignups] = useState<EventSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignup, setSelectedSignup] = useState<EventSignup | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const fetchSignups = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/signups/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch signups");
      const data = await response.json();
      setSignups(data);
    } catch (error) {
      console.error("Failed to fetch signups:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSignups();
  }, [fetchSignups]);

  if (isLoading) {
    return <div>Loading signups...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Signups for {eventTitle}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signups.map((signup) => (
              <TableRow key={signup.id}>
                <TableCell>{signup.fullName}</TableCell>
                <TableCell>{signup.email}</TableCell>
                <TableCell>
                  {format(new Date(signup.createdAt), "PPp")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSignup(signup);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signup Details</DialogTitle>
            <DialogDescription>
              View detailed information for this signup
            </DialogDescription>
          </DialogHeader>
          {selectedSignup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>{selectedSignup.fullName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{selectedSignup.email}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium">Signup Date</h3>
                  <p>{format(new Date(selectedSignup.createdAt), "PPp")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Form Responses</h3>
                  <div className="space-y-2">
                    {formFields.map((field) => (
                      <div key={field.id}>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {field.label}
                        </h4>
                        <p>{selectedSignup.formData[field.name] || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {terms && terms.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Accepted Terms</h3>
                    <div className="space-y-2">
                      {terms
                        .sort((a, b) => a.order - b.order)
                        .map((term) => (
                          <div key={term.id} className="flex items-start gap-2">
                            <p className="text-sm text-muted-foreground">
                              {term.text}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
