import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MiniPanel } from "@/components/blocks/MiniPanel";
import { PromoGrid } from "@/components/blocks/PromoGrid";
import { ShellPageTitle } from "@/components/blocks/ShellPageTitle";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.bonuses;
  const t = await getTranslations({ locale, namespace: "profile.bonuses" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

export default async function BonusesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "profile.bonuses" });

  return (
    <>
      <ShellPageTitle title={t("title")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniPanel
          label={t("activeBonus")}
          value={t("noActiveBonus")}
        />
        <MiniPanel label={t("vipCashback")} value="$0.00" tone="success" />
        <MiniPanel
          label={t("promoCode")}
          value={t("enterCode")}
          hint={t("promoHint")}
        />
      </div>
      <section className="mt-8">
        <SectionHeader icon="promo" title={t("liveOffers")} />
        <PromoGrid />
      </section>
    </>
  );
}
