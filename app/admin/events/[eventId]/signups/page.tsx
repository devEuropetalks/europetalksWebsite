import { EventSignupsList } from "@/components/admin/EventSignupsList";
import { db } from "@/lib/db";

type PageProps = {
  params: { eventId: string };
};

async function getEvent(eventId: string) {
  return await db.event.findUnique({
    where: { id: eventId },
    include: {
      formSchema: {
        include: {
          fields: true,
          terms: true,
        },
      },
    },
  });
}

export default async function EventSignupsPage({ params }: PageProps) {
  const event = await getEvent(params.eventId);

  if (!event) return <div>Event not found</div>;

  return (
    <div className="container py-6">
      <EventSignupsList
        eventId={event.id}
        eventTitle={event.title}
        formFields={event.formSchema?.fields || []}
        terms={event.formSchema?.terms || []}
      />
    </div>
  );
}
