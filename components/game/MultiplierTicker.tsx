"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { formatMultiplier } from "@/lib/format";

const SEED = [3.84, 12.08, 1.2, 16.28, 1.73, 1.69, 2.39, 1.4, 2.53, 1.05, 7.21];

export function MultiplierTicker({
  livePulse,
  serverHistory,
  className,
}: {
  livePulse?: number | null;
  /** Newest-first bust multipliers from the server history (optional). */
  serverHistory?: readonly number[] | undefined;
  className?: string;
}) {
  const [demoHistory, setDemoHistory] = useState<number[]>(SEED);

  const useDemoSynth =
    serverHistory === undefined || serverHistory.length === 0;

  useEffect(() => {
    if (!useDemoSynth) return;
    const id = window.setInterval(() => {
      setDemoHistory((prev) => {
        const value = Math.max(1.01, Math.min(120, 1 + Math.random() * 12));
        return [Number(value.toFixed(2)), ...prev].slice(0, 16);
      });
    }, 9000);
    return () => window.clearInterval(id);
  }, [useDemoSynth]);

  const history = useMemo(() => {
    const source =
      serverHistory && serverHistory.length > 0
        ? [...serverHistory].slice(0, 16)
        : demoHistory;
    if (livePulse == null || !Number.isFinite(livePulse)) return source;
    const value = Number(livePulse.toFixed(2));
    if (Math.abs((source[0] ?? 0) - value) < 0.005) return source;
    return [value, ...source].slice(0, 16);
  }, [demoHistory, livePulse, serverHistory]);

  return (
    <div
      className={cn(
        "no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-xl border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,transparent_50%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:gap-2 sm:rounded-2xl sm:p-2.5",
        className,
      )}
    >
      {history.map((value, i) => {
        const isLive =
          i === 0 &&
          livePulse != null &&
          Math.abs(value - livePulse) < 0.005;
        const tone =
          value >= 10
            ? "border-[var(--color-orange)]/40 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(255,140,80,0.18)_0%,rgba(255,140,80,0.04)_55%,transparent_100%)] text-[var(--color-orange)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_6px_16px_-10px_rgba(255,120,50,0.5)]"
            : value >= 2
              ? "border-[var(--color-brand)]/35 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(35,243,111,0.16)_0%,rgba(35,243,111,0.03)_55%,transparent_100%)] text-[var(--color-brand)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_16px_-10px_rgba(35,243,111,0.45)]"
              : "border-white/[0.08] bg-white/[0.03] text-white/70";
        return (
          <span
            key={`${value}-${i}`}
            className={cn(
              "numeric inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1.5 text-[12px] font-extrabold tabular-nums tracking-tight sm:px-3.5 sm:py-1.5 sm:text-[13px]",
              tone,
              isLive && "ring-2 ring-[var(--color-brand)]/70 ring-offset-2 ring-offset-[#070d18]",
            )}
          >
            {formatMultiplier(value)}
          </span>
        );
      })}
    </div>
  );
}
