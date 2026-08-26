import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShellPageTitle } from "@/components/blocks/ShellPageTitle";
import { TransactionsPanel } from "@/components/profile/TransactionsPanel";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.transactions;
  const t = await getTranslations({ locale, namespace: "profile.transactions" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile.transactions" });

  return (
    <>
      <ShellPageTitle title={t("title")} />
      <TransactionsPanel locale={locale} />
    </>
  );
}
