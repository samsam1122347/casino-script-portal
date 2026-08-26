import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/auth/SignupForm";
import { safeInternalRedirect } from "@/lib/auth/safe-redirect";
import { ROUTES } from "@/lib/paths";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("metaSignupTitle"),
    description: t("metaSignupDescription"),
  };
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <SignupForm redirectTo={safeInternalRedirect(from, ROUTES.home)} />;
}
