import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { PromoGrid } from "@/components/blocks/PromoGrid";
import { Faq } from "@/components/blocks/Faq";
import { assets } from "@/lib/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promotions" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function PromotionsPage() {
  const t = await getTranslations("promotions");

  return (
    <>
      <PageHero
        title={t("title")}
        body={t("body")}
        image={assets.hero.pagePromos}
      />
      <PromoGrid />
      <Faq />
    </>
  );
}
