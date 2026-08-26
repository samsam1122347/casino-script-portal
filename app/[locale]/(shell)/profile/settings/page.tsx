import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MiniPanel } from "@/components/blocks/MiniPanel";
import { ShellPageTitle } from "@/components/blocks/ShellPageTitle";
import { ChangePasswordCard } from "@/components/profile/ChangePasswordCard";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.settings;
  const t = await getTranslations({ locale, namespace: "profile.settings" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile.settings" });

  return (
    <>
      <ShellPageTitle title={t("title")} />
      <div className="grid gap-4">
        <ChangePasswordCard />
        <div className="grid gap-4 sm:grid-cols-2">
          <MiniPanel
            label={t("personalData")}
            value={t("protected")}
            tone="success"
          />
          <MiniPanel
            label={t("connectWallet")}
            value={t("cardOptions")}
          />
        </div>
      </div>
    </>
  );
}
