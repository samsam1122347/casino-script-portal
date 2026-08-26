import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { Partners } from "@/components/blocks/Partners";
import { Faq } from "@/components/blocks/Faq";
import { assets } from "@/lib/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sponsorships" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function SponsorshipsPage() {
  const t = await getTranslations("sponsorships");

  return (
    <>
      <PageHero
        title={t("title")}
        body={t("body")}
        image={assets.hero.pageSponsorships}
      />
      <Partners />
      <Faq />
    </>
  );
}
