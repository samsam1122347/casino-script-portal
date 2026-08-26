"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { acknowledgeResult, useCrashState } from "@/lib/game/crashStore";
import { formatMoney, formatMultiplier } from "@/lib/format";
import { cn } from "@/lib/cn";

const VISIBLE_MS = 2800;

export function CrashResultToast() {
  const t = useTranslations("crashGame");
  const result = useCrashState((s) => s.lastResult);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => {
      acknowledgeResult();
    }, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [result]);

  if (!result) return null;

  const isWin = result.kind === "win" || result.kind === "close";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-[110] flex justify-center px-4 sm:top-24"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-none relative flex min-w-[280px] max-w-[420px] flex-col items-center gap-2 overflow-hidden rounded-3xl border px-7 py-5 text-center backdrop-blur-xl",
          "animate-[resultPop_280ms_cubic-bezier(0.18,1.18,0.4,1)]",
          isWin
            ? "border-[var(--color-brand)]/45 bg-gradient-to-br from-[#06311e]/85 via-[#062a1a]/85 to-[#02110b]/90 shadow-[0_22px_60px_-18px_rgba(0,240,128,0.45)]"
            : "border-[var(--color-pink)]/45 bg-gradient-to-br from-[#311014]/85 via-[#1f0810]/85 to-[#150509]/90 shadow-[0_22px_60px_-18px_rgba(255,62,118,0.45)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage: isWin
              ? "radial-gradient(circle at 50% 0%, rgba(0,240,128,0.45), transparent 60%)"
              : "radial-gradient(circle at 50% 0%, rgba(255,62,118,0.45), transparent 60%)",
          }}
          aria-hidden
        />

        <span
          className={cn(
            "text-[10px] font-extrabold uppercase tracking-[0.32em]",
            isWin
              ? "text-[var(--color-brand)]/95"
              : "text-[var(--color-pink)]/95",
          )}
        >
          {result.kind === "win"
            ? t("toastAutoWin")
            : result.kind === "close"
              ? t("toastManualWin")
              : t("toastBust")}
        </span>

        <div className="flex items-baseline justify-center gap-2 font-[var(--font-display)]">
          <span
            className={cn(
              "numeric text-[clamp(1.85rem,5vw,2.55rem)] font-black tabular-nums leading-none tracking-[-0.04em]",
              isWin ? "text-white" : "text-[var(--color-pink)]",
            )}
          >
            {isWin
              ? `+${formatMoney(result.payout)}`
              : `−${formatMoney(result.bet)}`}
          </span>
        </div>

        <span
          className={cn(
            "numeric inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold tabular-nums uppercase tracking-[0.12em]",
            isWin
              ? "border-[var(--color-brand)]/40 bg-[var(--color-brand)]/12 text-[var(--color-brand)]"
              : "border-[var(--color-pink)]/40 bg-[var(--color-pink)]/12 text-[var(--color-pink)]",
          )}
        >
          {formatMultiplier(result.multiplier)}
        </span>
      </div>

      <style>{`
        @keyframes resultPop {
          0%   { opacity: 0; transform: translateY(-12px) scale(0.92); }
          70%  { opacity: 1; transform: translateY(0) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
