import { getGalleryEvents } from "@/lib/gallery";
import { GalleryProvider } from "./GalleryContext";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getGalleryEvents();

  return (
    <div className="min-h-screen">
      <GalleryProvider events={events}>{children}</GalleryProvider>
    </div>
  );
}
