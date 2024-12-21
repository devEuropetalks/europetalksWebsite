import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import ContentWrapper from "@/components/ContentWrapper";

export default async function HomePage() {
  return (
    <div>
      <ContentWrapper disableContainer>
        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] -mt-14 pt-14">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/europeByNight.jpg"
              alt="Europe by night from space"
              fill
              className="object-cover brightness-[0.4]"
              priority
              quality={100}
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full min-h-[60vh] flex items-center">
            <div className="text-center text-white w-full">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to EuropeTalks
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto text-center">
                Join our community of Europeans sharing ideas, culture, and
                creating connections across borders.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/events">Explore Events</Link>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="bg-white/20 hover:bg-white/30 text-white border-white"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </ContentWrapper>

      <ContentWrapper>
        {/* Features Section */}
        <section className="py-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <h2 className="text-2xl font-semibold mb-4">Cultural Exchange</h2>
            <p className="text-muted-foreground">
              Experience diverse European cultures through our events and
              workshops.
            </p>
          </div>
          <div className="text-center p-6">
            <h2 className="text-2xl font-semibold mb-4">Community</h2>
            <p className="text-muted-foreground">
              Connect with like-minded Europeans and build lasting
              relationships.
            </p>
          </div>
          <div className="text-center p-6">
            <h2 className="text-2xl font-semibold mb-4">Learning</h2>
            <p className="text-muted-foreground">
              Expand your knowledge through interactive discussions and
              workshops.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center bg-muted rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-muted-foreground mb-8">
            Become a member and get access to exclusive events and features.
          </p>
        </section>
      </ContentWrapper>
    </div>
  );
}
