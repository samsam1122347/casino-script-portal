import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, Rocket, ShieldCheck, Zap } from "lucide-react";
import { getSessionUser } from "@/lib/server/session-user";
import { CrashLiveSection } from "@/components/game/CrashLiveSection";
import { BetCard } from "@/components/game/BetCard";
import { CrashEconomyInit } from "@/components/game/CrashEconomyInit";
import { CrashLiveBetsTable } from "@/components/game/CrashLiveBetsTable";
import { HowToPlayDialog } from "@/components/game/HowToPlayDialog";
import { CrashResultToast } from "@/components/game/CrashResultToast";
import { MobileCashoutFab } from "@/components/game/MobileCashoutFab";
import { ROUTES } from "@/lib/paths";
import { assets } from "@/lib/assets";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";
import { SiteSchema } from "@/components/seo/SiteSchema";
import { env } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.crash;
  const t = await getTranslations({ locale, namespace: "crashGame" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

export default async function CrashPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "crashGame" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const user = await getSessionUser();
  const canSubscribeLive = Boolean(user);
  /** Laravel wallet-backed play when signed in (env defaults to on; set NEXT_PUBLIC_CRASH_REAL_MONEY=false for practice-only). */
  const realMoney = Boolean(user && env.NEXT_PUBLIC_CRASH_REAL_MONEY);

  return (
    <div className="w-full max-w-full overflow-x-clip">
      <SiteSchema kind="software" />
      <CrashResultToast />
      <CrashEconomyInit
        realMoney={realMoney}
        balanceMinor={user?.wallet?.balance_minor ?? 0}
      />

      <section className="relative mb-2 flex min-w-0 max-w-full items-center gap-2 overflow-x-clip sm:mb-4 sm:gap-3">
        <Link
          href={ROUTES.home}
          aria-label={tNav("home")}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-black/35 text-white/70 transition-colors hover:border-white/[0.14] hover:text-white sm:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <Link
          href={ROUTES.home}
          className="hidden items-center gap-1 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/65 transition-colors hover:border-white/[0.12] hover:text-white sm:inline-flex"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {tNav("home")}
        </Link>

        <h1 className="font-display flex min-w-0 flex-1 items-center gap-2 text-base font-extrabold tracking-[-0.04em] sm:gap-3 sm:text-xl xl:text-2xl">
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--color-bg-elevated)] ring-1 ring-white/10 sm:h-10 sm:w-10 sm:rounded-xl">
            <Image
              src={assets.crash.icon}
              alt={t("iconAlt")}
              width={315}
              height={420}
              sizes="40px"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="truncate bg-gradient-to-b from-white to-[#a7e7ff] bg-clip-text text-transparent">
            {t("heading")}
          </span>
        </h1>

        <ul
          className="no-scrollbar relative hidden items-center gap-2 sm:flex sm:flex-wrap"
          aria-label={t("trustChipsAria")}
        >
          {[
            { icon: ShieldCheck, label: t("chipProvablyFair") },
            { icon: Zap, label: t("chipInstantPayout") },
            { icon: Rocket, label: t("chipNoLimit") },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/[0.85]"
            >
              <Icon className="h-3.5 w-3.5 text-[var(--color-brand)]" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <HowToPlayDialog />
      </section>

      <section className="grid min-w-0 max-w-full gap-3 overflow-x-clip sm:gap-4 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] xl:items-start">
        <div className="order-2 min-w-0 xl:order-1">
          <BetCard realMoney={realMoney} />
        </div>
        <div className="order-1 min-w-0 xl:order-2">
          <CrashLiveSection
            canSubscribeLive={canSubscribeLive}
            walletBalanceMinor={user?.wallet?.balance_minor ?? 0}
          />
        </div>
      </section>

      {user ? <CrashLiveBetsTable /> : null}

      {/* Real-money-only responsible-gaming + mobile UX helpers. */}
      {realMoney ? <MobileCashoutFab /> : null}
    </div>
  );
}
