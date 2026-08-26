import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Coins,
  Gift,
  Mail,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { assets } from "@/lib/assets";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";
import { getSessionUser } from "@/lib/server/session-user";
import {
  FALLBACK_PROFILE_VIP,
  getProfileSummary,
} from "@/lib/server/profile-summary";
import { accountIdentityChip, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.profile;
  const t = await getTranslations({ locale, namespace: "profile.index" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}


export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile.index" });
  const tHero = await getTranslations({ locale, namespace: "hero" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const [user, summary] = await Promise.all([
    getSessionUser(),
    getProfileSummary(),
  ]);

  const displayName =
    user?.name?.trim() ||
    accountIdentityChip({
      username: user?.username,
      email: user?.email,
    }) ||
    "Player";
  const balanceMajor =
    user?.wallet?.balance_minor != null ? user.wallet.balance_minor / 100 : 0;
  const depositsMajor = (summary?.totals.deposits_minor ?? 0) / 100;
  const withdrawalsMajor = (summary?.totals.withdrawals_minor ?? 0) / 100;
  const bonusesMajor = (summary?.totals.bonuses_minor ?? 0) / 100;

  const vip = summary?.vip ?? FALLBACK_PROFILE_VIP;
  const tierMap = (tHero.raw("vipTiers") as Record<string, string> | undefined) ?? {};
  const tierTitle =
    tierMap[vip.tier_label_key] ??
    vip.tier_label_key.replace(/_/g, " ");

  const memberSinceLabel = user?.created_at
    ? new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(new Date(user.created_at))
    : null;

  const stats: {
    label: string;
    value: string;
    icon: typeof Wallet;
    accent: "neutral" | "success" | "danger" | "premium";
    sub?: string;
  }[] = [
    {
      label: t("walletBalance"),
      value: formatMoney(balanceMajor),
      icon: Wallet,
      accent: balanceMajor > 0 ? "success" : "neutral",
      sub: t("playableNow"),
    },
    {
      label: t("totalDeposits"),
      value: formatMoney(depositsMajor),
      icon: ArrowDownToLine,
      accent: "neutral",
    },
    {
      label: t("totalWithdrawals"),
      value: formatMoney(withdrawalsMajor),
      icon: ArrowUpRight,
      accent: "neutral",
    },
    {
      label: t("bonusCredits"),
      value: formatMoney(bonusesMajor),
      icon: Gift,
      accent: bonusesMajor > 0 ? "premium" : "neutral",
    },
  ];

  return (
    <>
      {/* IDENTITY HERO ───────────────────────────────────────── */}
      <section className="dashboard-shell relative isolate overflow-hidden">
        <Image
          src={assets.hero.profileBg}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1080px"
          className="-z-10 object-cover object-right opacity-[0.45]"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_70%_at_15%_30%,rgba(0,240,128,0.18),transparent_60%),radial-gradient(ellipse_55%_65%_at_85%_85%,rgba(146,92,255,0.16),transparent_60%),linear-gradient(180deg,rgba(7,11,24,0.55)_0%,rgba(7,11,24,0.85)_100%)]"
          aria-hidden
        />

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          {/* Avatar with VIP-tier ring */}
          <div className="relative inline-flex shrink-0 items-center justify-center self-start">
            <span
              className="absolute inset-0 -m-1.5 rounded-full bg-[conic-gradient(from_90deg,var(--color-brand),#925cff,#5eeedc,var(--color-brand))] opacity-90 blur-[1px]"
              aria-hidden
            />
            <span className="relative grid size-[88px] place-items-center overflow-hidden rounded-full bg-[var(--color-bg-elevated)] ring-2 ring-black/40 sm:size-[104px]">
              <Image
                src={assets.avatars.a22}
                alt=""
                width={104}
                height={104}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#132a50] to-[#0a1524] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent-ice)] ring-1 ring-[var(--color-purple)]/35">
              {tierTitle}
            </span>
          </div>

          {/* Name + meta */}
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--color-brand)]/80">
              {t("welcomeBack")}
            </p>
            <h1 className="font-display mt-1 break-all text-3xl font-black leading-tight tracking-[-0.045em] text-white sm:text-[2.5rem]">
              {displayName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-bold text-white/65">
              {user?.username ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand)]" aria-hidden />
                  <span className="truncate">@{user.username}</span>
                </span>
              ) : null}
              {user?.email ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                  <Mail className="h-3.5 w-3.5 opacity-80" aria-hidden />
                  <span className="truncate">{user.email}</span>
                </span>
              ) : null}
              {memberSinceLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-purple)]" aria-hidden />
                  {t("memberSince", { date: memberSinceLabel })}
                </span>
              ) : null}
            </div>

            {/* VIP progress with real numbers */}
            <div className="mt-5 max-w-[420px]">
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-[var(--color-purple)]" aria-hidden />
                  {t("vipProgress")}
                </span>
                <span className="numeric tabular-nums text-white/85">
                  {vip.at_max ? "100%" : `${vip.progress_percent}%`}
                </span>
              </div>
              <Progress
                className="mt-2 h-2"
                value={vip.at_max ? 100 : Math.min(100, Math.max(0, vip.progress_percent))}
              />
              {vip.at_max ? (
                <p className="mt-2 text-[11px] font-bold leading-relaxed text-white/45">
                  {tHero("vipAtMax")} — {tHero("vipMaxDetail")}
                </p>
              ) : (
                <div className="mt-2 flex flex-col gap-1 text-[11px] font-bold text-white/45 sm:flex-row sm:items-center sm:justify-between">
                  <span className="numeric tabular-nums">
                    {tHero("xpToNext", { xp: vip.xp_to_next })}
                  </span>
                  <span className="numeric tabular-nums">
                    {tHero("nextTierBonusMoney", {
                      amount: formatMoney(vip.next_tier_bonus_minor / 100),
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-2 lg:items-end">
            <Button asChild variant="primary" size="lg" className="w-full lg:w-auto">
              <Link href={ROUTES.deposit}>
                <ArrowDownToLine className="h-4 w-4" />
                {tNav("deposit")}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="md" className="w-full lg:w-auto">
              <Link href={ROUTES.withdraw}>
                <ArrowUpRight className="h-4 w-4" />
                {tNav("withdraw")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STAT CARDS ──────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent, sub }) => (
          <div
            key={label}
            className="dashboard-card relative overflow-hidden p-4 sm:p-5"
          >
            <span
              className={cn(
                "absolute inset-x-0 top-0 h-px",
                accent === "success" && "bg-gradient-to-r from-transparent via-[var(--color-brand)]/45 to-transparent",
                accent === "premium" && "bg-gradient-to-r from-transparent via-[var(--color-purple)]/45 to-transparent",
                accent === "danger" && "bg-gradient-to-r from-transparent via-[var(--color-pink)]/45 to-transparent",
                accent === "neutral" && "bg-gradient-to-r from-transparent via-white/10 to-transparent",
              )}
              aria-hidden
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/50">
                {label}
              </span>
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-lg ring-1 ring-inset",
                  accent === "success" &&
                    "bg-[var(--color-brand)]/[0.12] text-[var(--color-brand)] ring-[var(--color-brand)]/30",
                  accent === "premium" &&
                    "bg-[var(--color-purple)]/[0.12] text-[#c4b5ff] ring-[var(--color-purple)]/30",
                  accent === "danger" &&
                    "bg-[var(--color-pink)]/[0.12] text-[var(--color-pink)] ring-[var(--color-pink)]/30",
                  accent === "neutral" &&
                    "bg-white/[0.05] text-white/70 ring-white/[0.08]",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <strong
              className={cn(
                "numeric font-display mt-3 block text-2xl font-black tabular-nums leading-none tracking-[-0.035em]",
                accent === "success" && "text-[var(--color-brand)]",
                accent === "premium" && "text-[#d4c4ff]",
                accent === "danger" && "text-[var(--color-pink)]",
                accent === "neutral" && "text-white",
              )}
            >
              {value}
            </strong>
            {sub ? (
              <span className="mt-1 block text-[11px] font-bold text-white/40">{sub}</span>
            ) : null}
          </div>
        ))}
      </div>

      {/* SHORTCUT CARDS ──────────────────────────────────────── */}
      <div className="mt-5 grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Link
          href={ROUTES.bonuses}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#152238]/90 to-[#0a1220]/95 p-5 transition-colors hover:border-[var(--color-purple)]/35"
        >
          <Gift className="h-7 w-7 text-[var(--color-purple)]" aria-hidden />
          <h3 className="font-display mt-3 text-lg font-extrabold tracking-tight text-white">
            {tNav("bonuses")}
          </h3>
          <p className="mt-1 text-xs font-bold text-white/55">
            {t("bonusesShortcutBody")}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b8a6ff]">
            {t("openCta")} →
          </span>
        </Link>

        <Link
          href={ROUTES.transactions}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a1424]/85 to-[#070b18]/90 p-5 transition-colors hover:border-[var(--color-brand)]/35"
        >
          <Coins className="h-7 w-7 text-[var(--color-brand)]" aria-hidden />
          <h3 className="font-display mt-3 text-lg font-extrabold tracking-tight text-white">
            {tNav("transactions")}
          </h3>
          <p className="mt-1 text-xs font-bold text-white/55">
            {t("transactionsShortcutBody")}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-brand)]">
            {t("openCta")} →
          </span>
        </Link>

        <Link
          href={ROUTES.vip}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c0d31]/85 to-[#0a0410]/90 p-5 transition-colors hover:border-[#925cff]/45"
        >
          <Trophy className="h-7 w-7 text-[#a98bff]" aria-hidden />
          <h3 className="font-display mt-3 text-lg font-extrabold tracking-tight text-white">
            {tNav("vip")}
          </h3>
          <p className="mt-1 text-xs font-bold text-white/55">
            {t("vipShortcutBody")}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#a98bff]">
            {t("openCta")} →
          </span>
        </Link>
      </div>
    </>
  );
}
