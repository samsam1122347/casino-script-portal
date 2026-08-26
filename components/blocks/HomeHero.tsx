import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronRight, Rocket, ShieldCheck, Trophy, Zap } from "lucide-react";
import { ROUTES } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";
import type { ProfileVip } from "@/lib/server/profile-summary";
import { formatMoney } from "@/lib/format";
import { recentWinners } from "@/lib/data/dashboard";
import { LandingGridVideo } from "@/components/blocks/LandingGridVideo";
import { assets } from "@/lib/assets";

export async function HomeHero({
  vip,
  vipGuestMode = false,
}: {
  vip?: ProfileVip | null;
  vipGuestMode?: boolean;
} = {}) {
  const t = await getTranslations("hero");
  const tierMap = (t.raw("vipTiers") as Record<string, string> | undefined) ?? {};
  const tierLabel = (key: string): string => tierMap[key] ?? key.replace(/_/g, " ");
  const biggest = recentWinners[4];
  const liveRoundLabel = (t.raw("liveRoundEyebrow") as string | undefined) ?? "Round in flight";
  const lastWinLabel = (t.raw("lastWinEyebrow") as string | undefined) ?? "Last big win";

  return (
    <section className="dashboard-shell relative isolate overflow-hidden">
      <LandingGridVideo
        src={assets.media.heroMoon}
        poster={assets.crash.background}
        priority
        className="absolute inset-0 h-full w-full opacity-[0.78]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_22%_18%,rgba(138,85,255,0.32),transparent_60%),radial-gradient(ellipse_70%_55%_at_82%_82%,rgba(35,243,111,0.22),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,13,0.05)_0%,rgba(3,5,14,0.55)_55%,rgba(3,5,14,0.92)_100%),linear-gradient(90deg,rgba(2,4,13,0.6)_0%,rgba(3,5,14,0.1)_46%,rgba(3,5,14,0.78)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-brand)]/40 to-transparent"
      />

      <div className="relative grid min-h-[min(96dvh,600px)] gap-6 p-4 sm:min-h-[540px] sm:p-7 lg:min-h-[600px] lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)] lg:gap-8 lg:p-9 xl:p-10">
        <div className="relative flex flex-col justify-end gap-5 pt-24 sm:pt-32 lg:pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative inline-flex items-center gap-1.5 rounded-full border border-[var(--color-pink)]/35 bg-[var(--color-pink)]/[0.12] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-pink)] backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-pink)]/70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-pink)] shadow-[0_0_10px_rgba(255,87,153,0.8)]" />
              </span>
              Live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              {SITE.name}
            </span>
          </div>

          <h1 className="font-display font-black tracking-[-0.04em] text-white">
            <span className="block text-base font-extrabold leading-snug text-white/82 sm:text-lg lg:text-xl">
              {t("welcomeLead")}
            </span>
            <span className="green-text-glow mt-1 block text-[clamp(2.4rem,8.4vw,4.6rem)] leading-[0.95]">
              {t("welcomeAccent")}
            </span>
          </h1>

          <p className="max-w-[48ch] text-sm font-semibold leading-relaxed text-white/75 sm:text-[0.9375rem] lg:text-base">
            {t("tagline")}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={ROUTES.crash}
              aria-label={`${t("ctaTitle")}. ${t("ctaHint")}`}
              className={cn(
                "group relative isolate inline-flex min-h-[56px] max-w-full items-center gap-3 overflow-hidden rounded-full border border-neutral-950/30 py-2 pl-5 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_44px_-12px_rgba(35,243,111,0.6),0_0_0_1px_rgba(0,0,0,0.25)] motion-safe:transition-[filter,transform,box-shadow] motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:brightness-[1.05] motion-safe:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_18px_54px_-12px_rgba(35,243,111,0.7)] motion-safe:active:translate-y-px sm:min-h-[60px] sm:pl-7 sm:pr-2.5",
                "bg-[linear-gradient(185deg,#8fffb9_0%,#3ae276_42%,#14c965_74%,#0a8f46_100%)]",
                "text-neutral-950",
              )}
            >
              <Rocket
                className="relative z-[1] h-5 w-5 shrink-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:rotate-12"
                aria-hidden
                strokeWidth={2.5}
              />
              <span className="relative z-[1] min-w-0 flex-1 py-1 text-left leading-tight">
                <span className="block font-display text-[1.0625rem] font-black tracking-tight sm:text-[1.125rem]">
                  {t("ctaTitle")}
                </span>
                <span className="mt-0.5 block text-[0.625rem] font-extrabold uppercase tracking-[0.2em] text-neutral-950/75">
                  {t("ctaHint")}
                </span>
              </span>
              <span
                className="relative z-[1] grid size-11 shrink-0 place-items-center self-stretch rounded-full bg-neutral-950/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.34)] ring-2 ring-neutral-950/10 sm:size-12"
                aria-hidden
              >
                <ChevronRight
                  className="size-[1.25rem] text-neutral-950 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 sm:size-[22px]"
                  strokeWidth={2.75}
                />
              </span>
            </Link>

            <ul className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/55 sm:gap-3 sm:text-[11px]">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-brand)]" aria-hidden />
                Provably fair
              </li>
              <li aria-hidden className="text-white/20">·</li>
              <li className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[var(--color-accent-ice)]" aria-hidden />
                Instant payouts
              </li>
            </ul>
          </div>
        </div>

        <aside className="relative z-10 flex flex-col gap-3 sm:gap-4">
          <div className="dashboard-card relative overflow-hidden p-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[inherit] sm:aspect-[16/10]">
              <LandingGridVideo
                src={assets.media.heroMoonAlt}
                poster={assets.crash.background}
                className="absolute inset-0 h-full w-full"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,13,0.05)_0%,rgba(2,4,13,0.4)_60%,rgba(2,4,13,0.92)_100%)]"
              />
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/45 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand)] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_10px_rgba(35,243,111,0.85)]" />
                </span>
                {liveRoundLabel}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
                    {lastWinLabel}
                  </p>
                  <p className="numeric mt-0.5 font-display text-3xl font-black leading-none text-white drop-shadow-[0_2px_18px_rgba(35,243,111,0.5)] sm:text-[2.25rem]">
                    {biggest.multiplier.toFixed(2)}
                    <span className="ml-0.5 text-[var(--color-brand)]">x</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="numeric text-base font-extrabold leading-tight text-[var(--color-brand)] drop-shadow-[0_2px_14px_rgba(35,243,111,0.45)] sm:text-lg">
                    {formatMoney(biggest.amount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-3.5 py-3 sm:px-4">
              <Image
                src={biggest.avatar}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover ring-2 ring-[var(--color-brand)]/35"
              />
              <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">
                {biggest.username}
              </p>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                · just now
              </span>
            </div>
          </div>

          <div className="dashboard-card relative overflow-hidden p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand)]/[0.14] text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30">
                <Trophy className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-white">
                  {vipGuestMode
                    ? t("guestTierTitle")
                    : tierLabel(vip?.tier_label_key ?? "bronze_1")}
                </p>
                <p className="truncate text-[11px] font-semibold text-white/55">
                  {vipGuestMode
                    ? t("guestVipHint")
                    : t("nextTierBonusMoney", {
                        amount: formatMoney((vip?.next_tier_bonus_minor ?? 0) / 100),
                      })}
                </p>
              </div>
            </div>
            <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-black/45 ring-1 ring-white/[0.04]">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand)_0%,#5eeedc_100%)] shadow-[0_0_20px_rgba(35,243,111,0.55)] transition-[width] duration-700"
                style={{
                  width: `${vipGuestMode ? 0 : Math.min(100, Math.max(0, vip?.progress_percent ?? 0))}%`,
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
