import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { Faq } from "@/components/blocks/Faq";
import { NewsCards } from "@/components/blocks/NewsCards";
import { assets } from "@/lib/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("pageTitle"),
    description: t("long"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <>
      <PageHero
        title={t("sectionTitle")}
        body={t("long")}
        image={assets.hero.pageAbout}
      />
      <article className="rounded-2xl bg-[var(--color-panel)] p-6 sm:p-8">
        <h2 className="h3">{t("builtHeading")}</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--color-text-muted)] sm:text-base">
          {t("long")}
        </p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--color-text-muted)] sm:text-base">
          {t("builtExtra")}
        </p>
      </article>
      <Faq />
      <NewsCards />
    </>
  );
}
