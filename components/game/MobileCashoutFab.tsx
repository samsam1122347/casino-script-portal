"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { manualCashOut, useCrashState } from "@/lib/game/crashStore";
import { unlockCrashSounds } from "@/lib/game/crashSounds";
import { formatMoney, formatMultiplier } from "@/lib/format";
import { toast } from "@/lib/toast-bus";

/**
 * Fixed bottom-right cash-out button for small screens. Mirrors BetCard's
 * cash-out CTA so a player who has scrolled the chart out of view can still
 * bail out. Only mounts in real-money mode while a bet is actively running.
 */
export function MobileCashoutFab() {
  const t = useTranslations("crashGame");
  const mode = useCrashState((s) => s.mode);
  const active = useCrashState((s) => s.active);
  const phase = useCrashState((s) => s.phase);
  const liveMultiplier = useCrashState((s) => s.multiplier);
  const cashoutInFlight = useCrashState((s) => s.cashoutInFlight);

  const handleCashOut = useCallback(async () => {
    unlockCrashSounds();
    const result = await manualCashOut();
    if (
      !result.ok &&
      result.reason &&
      result.reason !== "busy" &&
      result.reason !== "no-active" &&
      result.reason !== "too-low"
    ) {
      toast({
        variant: "destructive",
        title: t("cashOutFailedTitle"),
        description: result.reason,
      });
    }
  }, [t]);

  const visible = mode === "real" && Boolean(active) && phase === "running";
  if (!visible || !active) return null;

  const projectedPayout = +(active.betUsd * liveMultiplier).toFixed(2);

  return (
    <button
      type="button"
      onClick={() => void handleCashOut()}
      disabled={cashoutInFlight}
      aria-label={t("fabCashOutAria")}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[115] flex flex-col items-center justify-center gap-0.5 rounded-full bg-gradient-to-br from-[var(--color-orange)] via-[#ff6e2c] to-[var(--color-pink)] px-4 py-3 text-white shadow-[0_0_44px_-8px_rgba(255,110,44,0.65)] animate-[cashPulse_1.4s_ease-in-out_infinite] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:animate-none disabled:opacity-70 sm:hidden"
    >
      <span className="text-[10px] font-extrabold uppercase tracking-[0.08em]">
        {cashoutInFlight ? t("cashingOut") : t("cashOutNow")}
      </span>
      <span className="numeric text-[11px] font-extrabold tabular-nums leading-none">
        {formatMoney(projectedPayout)} · {formatMultiplier(liveMultiplier)}
      </span>
      <style>{`
        @keyframes cashPulse {
          0%, 100% { transform: translateZ(0) scale(1); box-shadow: 0 0 36px -10px rgba(255,110,44,0.55); }
          50% { transform: translateZ(0) scale(1.04); box-shadow: 0 0 56px -8px rgba(255,110,44,0.85); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="cashPulse"] { animation: none !important; }
        }
      `}</style>
    </button>
  );
}
