import { CreateEventButton } from "@/components/admin/CreateEventButton";
import { EventList } from "@/components/admin/EventList";
import ContentWrapper from "@/components/ContentWrapper";

export default function AdminEventsPage() {
  return (
    <ContentWrapper>
      <div className="container py-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Events</h1>
          <CreateEventButton />
        </div>
        <EventList />
      </div>
    </ContentWrapper>
  );
}
