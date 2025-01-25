import { db } from "@/lib/db";
import { EventSignupsList } from "@/components/admin/EventSignupsList";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function EventSignupsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: {
      formSchema: {
        include: {
          fields: true,
          terms: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/signups">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to All Signups
          </Link>
        </Button>
      </div>
      <EventSignupsList
        eventId={event.id}
        eventTitle={event.title}
        formFields={event.formSchema?.fields || []}
        terms={event.formSchema?.terms || []}
      />
    </div>
  );
}
