import { getGalleryEvents } from "@/lib/gallery";
import { GalleryProvider } from "./GalleryContext";
import ContentWrapper from "@/components/ContentWrapper";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getGalleryEvents();

  return (
    <div className="min-h-screen">
      <ContentWrapper>
        <GalleryProvider events={events}>{children}</GalleryProvider>
      </ContentWrapper>
    </div>
  );
}
