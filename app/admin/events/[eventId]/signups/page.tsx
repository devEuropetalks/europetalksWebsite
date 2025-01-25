import { EventSignupsList } from "@/components/admin/EventSignupsList";
import { db } from "@/lib/db";

export default async function EventSignupsPage(props: {
  params: Promise<{ eventId: string }>;
}) {
  const params = await props.params;
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
