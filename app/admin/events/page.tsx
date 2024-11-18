import { CreateEventButton } from "@/components/admin/CreateEventButton";
import { EventList } from "@/components/admin/EventList";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Events</h2>
        <CreateEventButton />
      </div>
      <EventList />
    </div>
  );
}
