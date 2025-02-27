"use client";

import ContentWrapper from "@/components/ContentWrapper";
import Image from "next/image";
import { Slideshow } from "@/components/Slideshow";
import { useTranslation } from "react-i18next";
import { AquarelleBackground } from "@/components/AquarelleBackground";

export default function AboutPage() {
  const { t } = useTranslation("about");

  return (
    <ContentWrapper className="max-w-4xl py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
        <AquarelleBackground className="rounded-lg p-8" fixedColor="gelb">
          <section>
            <h2 className="text-3xl font-semibold mb-4">{t("whoWeAre.title")}</h2>
            <p>{t("whoWeAre.intro")}</p>
            <p>{t("whoWeAre.mission")}</p>
          </section>
        </AquarelleBackground>

        <AquarelleBackground className="rounded-lg p-8 text-center" fixedColor="rot">
          <section>
            <h2 className="text-3xl font-semibold mb-4">{t("leadership.title")}</h2>
            <p>{t("leadership.intro")}</p>
            <div className="flex items-start gap-6 my-6 justify-center">
              <div className="w-24 h-24 shrink-0">
                <Image
                  src="/images/vivien-costanzo.jpeg"
                  alt={t("leadership.name")}
                  width={900}
                  height={676}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-center">
                <h3 className="text-xl font-semibold mb-2">{t("leadership.name")}</h3>
                <p className="text-muted-foreground">
                  {t("leadership.role.title")},
                  <br />
                  {t("leadership.role.party")}
                </p>
              </div>
            </div>
          </section>
        </AquarelleBackground>

        <AquarelleBackground className="rounded-lg p-8" fixedColor="blau">
          <section>
            <h2 className="text-3xl font-semibold mb-4">{t("background.title")}</h2>
            <p>{t("background.conference")}</p>
            <p>{t("background.activists")}</p>
            <p>{t("background.perspective")}</p>
            <p>{t("background.countries")}</p>
          </section>
        </AquarelleBackground>

        <AquarelleBackground className="rounded-lg p-8" fixedColor="grün">
          <section>
            <h2 className="text-3xl font-semibold mb-4">{t("howWeWork.title")}</h2>
            <p>{t("howWeWork.intro")}</p>
            <p>{t("howWeWork.method")}</p>
            <p>{t("howWeWork.workshops")}</p>
            <p>{t("howWeWork.papers")}</p>
            <p>{t("howWeWork.support")}</p>
          </section>
        </AquarelleBackground>

        <section>
          <h2 className="text-3xl font-semibold mb-4 text-center">
            {t("getToKnowUs.title")}
          </h2>
          <div className="mt-6">
            <Slideshow interval={5000} />
          </div>
        </section>
      </div>
    </ContentWrapper>
  );
}
