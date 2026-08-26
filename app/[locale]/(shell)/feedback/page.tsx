import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { Reviews } from "@/components/blocks/Reviews";
import { Faq } from "@/components/blocks/Faq";
import { assets } from "@/lib/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function FeedbackPage() {
  const t = await getTranslations("feedback");

  return (
    <>
      <PageHero
        title={t("title")}
        body={t("body")}
        image={assets.hero.pageFeedback}
      />
      <Reviews />
      <Faq />
    </>
  );
}
