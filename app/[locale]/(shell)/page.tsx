import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeHero } from "@/components/blocks/HomeHero";
import { PromoStrip } from "@/components/blocks/PromoStrip";
import { LandingGrid } from "@/components/blocks/LandingGrid";
import { GameSection } from "@/components/blocks/GameSection";
import { Partners } from "@/components/blocks/Partners";
import { VipCta } from "@/components/blocks/VipCta";
import { Faq } from "@/components/blocks/Faq";
import { AboutBlock } from "@/components/blocks/AboutBlock";
import { NewsCards } from "@/components/blocks/NewsCards";
import { DashboardPanels } from "@/components/blocks/DashboardPanels";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";
import { assets } from "@/lib/assets";
import { getSessionUser } from "@/lib/server/session-user";
import {
  FALLBACK_PROFILE_VIP,
  getProfileSummary,
} from "@/lib/server/profile-summary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.home;
  const languages = alternateLanguageUrls(path);
  return {
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages,
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations("home");

  const user = await getSessionUser();
  const summary = user ? await getProfileSummary() : null;

  return (
    <>
      <HomeHero
        vip={user ? (summary?.vip ?? FALLBACK_PROFILE_VIP) : undefined}
        vipGuestMode={!user}
      />
      <PromoStrip />
      <LandingGrid />
      <GameSection
        icon="flame"
        title={t("gameSectionTitle")}
        viewHref={ROUTES.crash}
        heroVideo={{
          src: assets.media.landingPlayCrash,
          poster: assets.crash.rocket,
        }}
      />
      <DashboardPanels />
      <div className="home-below-fold">
        <Partners />
        <VipCta />
        <Faq />
        <AboutBlock />
        <NewsCards />
      </div>
    </>
  );
}
