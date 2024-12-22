"use client";

import ContentWrapper from "@/components/ContentWrapper";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation("contact");

  return (
    <ContentWrapper>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
        <p className="text-lg mb-8">{t("description")}</p>

        <form className="space-y-6">
          <div>
            <label className="block mb-2">{t("form.name")}</label>
            <input type="text" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">{t("form.email")}</label>
            <input type="email" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">{t("form.subject")}</label>
            <input type="text" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">{t("form.message")}</label>
            <textarea className="w-full p-2 border rounded" rows={6}></textarea>
          </div>
          <button className="bg-primary text-white px-6 py-2 rounded">
            {t("form.submit")}
          </button>
        </form>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">{t("info.title")}</h2>
          <p className="mb-2">
            {t("info.email")} <a href="mailto:contact@europetalks.eu">contact@europetalks.eu</a>
          </p>
          <p>{t("info.social")}</p>
        </div>
      </div>
    </ContentWrapper>
  );
}
