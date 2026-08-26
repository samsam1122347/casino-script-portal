import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShellPageTitle } from "@/components/blocks/ShellPageTitle";
import { WithdrawPanel } from "@/components/profile/WithdrawPanel";
import { TransactionsPanel } from "@/components/profile/TransactionsPanel";
import { getTenantCryptoAssets } from "@/lib/server/tenant-crypto";
import { getSessionUser } from "@/lib/server/session-user";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.withdraw;
  const t = await getTranslations({ locale, namespace: "profile.withdraw" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

export default async function WithdrawPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile.withdraw" });
  const cryptoAssets = await getTenantCryptoAssets();
  const user = await getSessionUser();

  return (
    <>
      <ShellPageTitle title={t("title")} />
      <WithdrawPanel
        apiAssets={cryptoAssets}
        balanceMinor={user?.wallet?.balance_minor ?? null}
      />
      <div className="mt-10">
        <TransactionsPanel locale={locale} />
      </div>
    </>
  );
}
