import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { VipCta } from "@/components/blocks/VipCta";
import { Faq } from "@/components/blocks/Faq";
import { FeatureTile } from "@/components/blocks/FeatureTile";
import { Icon } from "@/components/icons";
import { assets } from "@/lib/assets";
import { vipPerks } from "@/lib/data/vip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vip" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function VipPage() {
  const t = await getTranslations("vip");

  return (
    <>
      <PageHero
        title={t("title")}
        body={t("body")}
        image={assets.hero.pageVip}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vipPerks.map((perk) => (
          <FeatureTile
            key={perk.id}
            icon={<Icon name={perk.icon} className="h-5 w-5" />}
            title={perk.title}
            body={perk.description}
          />
        ))}
      </div>
      <VipCta />
      <Faq />
    </>
  );
}
