import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShellPageTitle } from "@/components/blocks/ShellPageTitle";
import { DepositPanel } from "@/components/profile/DepositPanel";
import { TransactionsPanel } from "@/components/profile/TransactionsPanel";
import { getTenantCryptoAssets } from "@/lib/server/tenant-crypto";

import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.deposit;
  const t = await getTranslations({ locale, namespace: "profile.deposit" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

export default async function DepositPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile.deposit" });
  const cryptoAssets = await getTenantCryptoAssets();

  return (
    <>
      <ShellPageTitle title={t("title")} />
      <DepositPanel apiAssets={cryptoAssets} />
      <div className="mt-10">
        <TransactionsPanel locale={locale} />
      </div>
    </>
  );
}
