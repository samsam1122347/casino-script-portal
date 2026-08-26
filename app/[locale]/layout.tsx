import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppToaster } from "@/components/ui/AppToaster";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { SupportChatProvider } from "@/components/support/SupportChatContext";
import { SiteSchema } from "@/components/seo/SiteSchema";
import { TenantThemeBridge } from "@/components/theme/TenantThemeBridge";
import { PwaServiceWorkerRegister } from "@/components/pwa/PwaServiceWorkerRegister";
import { HtmlLang } from "@/components/i18n/HtmlLang";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <HtmlLang locale={locale} />
      <TenantThemeBridge />
      <TooltipProvider delayDuration={150}>
        <SupportChatProvider>{children}</SupportChatProvider>
      </TooltipProvider>
      <AppToaster />
      <SiteSchema kind="site" />
      <SiteSchema kind="organization" />
      <PwaServiceWorkerRegister />
    </NextIntlClientProvider>
  );
}
