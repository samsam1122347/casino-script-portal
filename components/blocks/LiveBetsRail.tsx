"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Activity, Flame, Trophy } from "lucide-react";
import {
  createLiveBet,
  createTopMultipliers,
  seedLiveBets,
  type LiveBet,
  type TopMultiplier,
} from "@/lib/data/liveBets";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const FEED_SIZE = 9;
const TICK_MS = 2400;
const RESHUFFLE_MS = 16000;

const HUE_GRADIENTS = [
  "from-[#ff7a32] to-[#ff3368]",
  "from-[#3477e8] to-[#8a55ff]",
  "from-[#00f080] to-[#1f9e8a]",
  "from-[var(--color-brand)] to-[#ff7a32]",
  "from-[#5eeadb] to-[#3477e8]",
  "from-[#ff3368] to-[#8a55ff]",
  "from-[#8a55ff] to-[#3477e8]",
  "from-[#00f080] to-[#5eeadb]",
];

function avatarBubble(username: string, hue: number) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-[13px] font-extrabold uppercase text-black/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] ring-1 ring-white/10",
        HUE_GRADIENTS[hue] ?? HUE_GRADIENTS[0],
      )}
      aria-hidden
    >
      {username.slice(0, 2)}
    </span>
  );
}

function MultiplierChip({ value }: { value: number }) {
  const tone =
    value >= 10
      ? "bg-[var(--color-orange)]/15 text-[var(--color-orange)] ring-[var(--color-orange)]/30"
      : value >= 2
        ? "bg-[var(--color-brand)]/14 text-[var(--color-brand)] ring-[var(--color-brand)]/30"
        : "bg-white/[0.05] text-white/85 ring-white/[0.1]";
  return (
    <span
      className={cn(
        "numeric inline-flex items-center justify-center rounded-lg px-2 py-1 text-[11px] font-extrabold tabular-nums ring-1 ring-inset",
        tone,
      )}
    >
      ×{value.toFixed(2)}
    </span>
  );
}

export function LiveBetsRail({ className }: { className?: string }) {
  const t = useTranslations("liveActivity");
  const locale = useLocale();
  const [bets, setBets] = useState<LiveBet[]>([]);
  const [tops, setTops] = useState<TopMultiplier[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    const seedFrame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      setBets(seedLiveBets(FEED_SIZE, locale));
      setTops(createTopMultipliers(7, locale));
    });

    let tickId: number | undefined;
    let reshuffleId: number | undefined;
    let visible = true;
    let onScreen = true;

    const start = () => {
      if (tickId !== undefined || reshuffleId !== undefined) return;
      if (!visible || !onScreen) return;
      tickId = window.setInterval(() => {
        setBets((prev) => [createLiveBet(locale), ...prev].slice(0, FEED_SIZE));
        setNow(Date.now());
      }, TICK_MS);
      reshuffleId = window.setInterval(() => {
        setTops(createTopMultipliers(7, locale));
      }, RESHUFFLE_MS);
    };

    const stop = () => {
      if (tickId !== undefined) window.clearInterval(tickId);
      if (reshuffleId !== undefined) window.clearInterval(reshuffleId);
      tickId = undefined;
      reshuffleId = undefined;
    };

    const syncRunning = () => {
      if (visible && onScreen) start();
      else stop();
    };

    const onVisibility = () => {
      visible = !document.hidden;
      syncRunning();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | null = null;
    if (sectionRef.current && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            onScreen = entry.isIntersecting;
          }
          syncRunning();
        },
        { rootMargin: "100px", threshold: 0.01 },
      );
      observer.observe(sectionRef.current);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(seedFrame);
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [locale]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "mt-4 grid min-w-0 max-w-full gap-4 overflow-x-clip lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]",
        className,
      )}
    >
      {/* LIVE BETS — vertical feed */}
      <article className="dashboard-shell overflow-hidden">
        <header className="flex min-w-0 items-center justify-between gap-3 border-b border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30">
              <Activity className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-extrabold tracking-tight text-white">
                {t("liveBetsTitle")}
              </h2>
              <p className="text-[11px] font-bold text-white/40">
                {t("liveBetsSub")}
              </p>
            </div>
          </div>
          {/* These feeds are synthetic (see lib/data/liveBets.ts) — on a
              real-money site an unlabelled "live" feed would be misleading, so
              we keep the visual but mark it clearly as illustrative rather
              than building a fake backend stream. */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/55 ring-1 ring-white/[0.1]">
            {t("demoChip")}
          </span>
        </header>

        <ul className="grid divide-y divide-white/[0.05]" role="list">
          {bets.map((bet, idx) => {
            const isFresh = now - bet.emittedAt < TICK_MS - 200;
            return (
              <li
                key={bet.id}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-3.5 py-2.5 transition-colors sm:gap-3 sm:px-5 sm:py-3",
                  idx === 0 && isFresh && "bg-[var(--color-brand)]/[0.04]",
                )}
                style={{
                  animation:
                    idx === 0 && isFresh
                      ? "liveBetEnter 380ms cubic-bezier(0.22,1,0.36,1)"
                      : undefined,
                }}
              >
                {avatarBubble(bet.username, bet.hue)}
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-white/[0.92]">
                    {bet.username}
                  </p>
                  <p className="numeric text-[11px] font-bold text-white/40">
                    {t("stakeLabel")} {formatMoney(bet.betUsd)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {bet.status === "won" && bet.multiplier ? (
                    <MultiplierChip value={bet.multiplier} />
                  ) : (
                    <span className="numeric inline-flex items-center justify-center rounded-lg bg-[var(--color-pink)]/12 px-2 py-1 text-[11px] font-extrabold tabular-nums text-[var(--color-pink)] ring-1 ring-inset ring-[var(--color-pink)]/25">
                      {t("bustChip")}
                    </span>
                  )}
                  <strong
                    className={cn(
                      "numeric ml-1 max-w-[8ch] truncate text-right text-[12px] font-extrabold tabular-nums sm:max-w-none sm:text-[13px]",
                      bet.status === "won"
                        ? "text-[var(--color-brand)]"
                        : "text-white/35 line-through",
                    )}
                  >
                    {bet.status === "won"
                      ? `+${formatMoney(bet.payoutUsd)}`
                      : formatMoney(bet.betUsd)}
                  </strong>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-white/[0.05] px-4 py-2.5 text-[10px] font-bold text-white/35 sm:px-5">
          {t("demoNote")}
        </p>

        <style>{`
          @keyframes liveBetEnter {
            0% { opacity: 0; transform: translateY(-8px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </article>

      {/* TOP MULTIPLIERS — pillar */}
      <article className="dashboard-shell flex flex-col overflow-hidden">
        <header className="flex min-w-0 items-center justify-between gap-3 border-b border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#152238] to-[#0c1526] text-[var(--color-accent-ice)] ring-1 ring-[var(--color-accent-ice)]/30">
              <Trophy className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-extrabold tracking-tight text-white">
                {t("topMultipliersTitle")}
              </h2>
              <p className="text-[11px] font-bold text-white/40">
                {t("topMultipliersSub")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/55 ring-1 ring-white/[0.1]">
              {t("demoChip")}
            </span>
            <Flame className="h-4 w-4 text-[var(--color-orange)]" aria-hidden />
          </div>
        </header>

        <ol className="grid divide-y divide-white/[0.05]" role="list">
          {tops.slice(0, 7).map((row, idx) => (
            <li
              key={row.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2.5 px-3.5 py-2.5 sm:gap-3 sm:px-5 sm:py-3"
            >
              <span
                className={cn(
                  "numeric grid h-7 w-7 place-items-center rounded-lg text-[12px] font-extrabold tabular-nums",
                  idx === 0
                    ? "bg-gradient-to-br from-[var(--color-brand)] to-[#045c3e] text-[#021108] shadow-[0_0_18px_-4px_rgba(0,240,128,0.5)]"
                    : idx === 1
                      ? "bg-white/[0.08] text-white"
                      : idx === 2
                        ? "bg-[#12223a]/80 text-[var(--color-accent-ice)]"
                        : "bg-white/[0.04] text-white/60",
                )}
              >
                {idx + 1}
              </span>
              <span className="truncate text-sm font-extrabold text-white/[0.92]">
                {row.username}
              </span>
              <span className="numeric text-[12px] font-extrabold tabular-nums text-[var(--color-orange)]">
                ×{row.multiplier.toFixed(2)}
              </span>
              <strong className="numeric text-[12px] font-extrabold tabular-nums text-[var(--color-brand)]">
                {formatMoney(row.payoutUsd)}
              </strong>
            </li>
          ))}
        </ol>
        <p className="mt-auto border-t border-white/[0.05] px-4 py-2.5 text-[10px] font-bold text-white/35 sm:px-5">
          {t("demoNote")}
        </p>
      </article>
    </section>
  );
}
