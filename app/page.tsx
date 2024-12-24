"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import ContentWrapper from "@/components/ContentWrapper";
import { useTranslation } from "react-i18next";
import Typewriter from "typewriter-effect";

export default function HomePage() {
  const { t } = useTranslation("home");

  const heroTitle = t("hero.title");

  return (
    <div>
      <ContentWrapper disableContainer>
        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] -mt-14 pt-14">
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

          <div className="relative z-10 w-full min-h-[60vh] flex items-center">
            <div className="text-center text-white w-full">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <Typewriter
                  options={{
                    strings: [heroTitle],
                    autoStart: true,
                    loop: true,
                  }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString(heroTitle)
                      .pauseFor(5000)
                      .deleteAll()
                      .start();
                  }}
                />
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto text-center">
                {t("hero.subtitle")}
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/events">{t("cta.buttons.explore")}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="bg-white/20 hover:bg-white/30 text-white border-white"
                >
                  <Link href="/about">{t("cta.buttons.learnMore")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </ContentWrapper>

      <ContentWrapper>
        {/* Features Section */}
        <section className="py-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 -z-10">
              <Image
                src="/images/flags.jpg"
                alt="European flags"
                fill
                className="object-cover brightness-[0.4]"
                quality={100}
              />
            </div>
            <div className="relative z-10 text-white">
              <h2 className="text-2xl font-semibold mb-4">
                {t("features.cultural.title")}
              </h2>
              <p className="text-gray-200">
                {t("features.cultural.description")}
              </p>
            </div>
          </div>

          <div className="text-center p-6 relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 -z-10">
              <Image
                src="/images/community.jpg"
                alt="European community"
                fill
                className="object-cover brightness-[0.4]"
                quality={100}
              />
            </div>
            <div className="relative z-10 text-white">
              <h2 className="text-2xl font-semibold mb-4">
                {t("features.community.title")}
              </h2>
              <p className="text-gray-200">
                {t("features.community.description")}
              </p>
            </div>
          </div>

          <div className="text-center p-6 relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 -z-10">
              <Image
                src="/images/learning.jpg"
                alt="Learning together"
                fill
                className="object-cover brightness-[0.4]"
                quality={100}
              />
            </div>
            <div className="relative z-10 text-white">
              <h2 className="text-2xl font-semibold mb-4">
                {t("features.knowledge.title")}
              </h2>
              <p className="text-gray-200">
                {t("features.knowledge.description")}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center bg-muted rounded-lg">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("cta.description")}</p>
        </section>
      </ContentWrapper>
    </div>
  );
}
