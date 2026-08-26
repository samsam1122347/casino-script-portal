"use client";

import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCrashState } from "@/lib/game/crashStore";

export function BalancePill({
  balanceMajor,
  className,
  size = "default",
}: {
  balanceMajor: number;
  className?: string;
  size?: "default" | "compact";
}) {
  const t = useTranslations("topbar");
  const mode = useCrashState((s) => s.mode);
  const liveBalanceMinor = useCrashState((s) => s.realBalanceMinor);
  const compact = size === "compact";
  const displayBalance = mode === "real" ? liveBalanceMinor / 100 : balanceMajor;

  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-b from-[var(--color-panel-2)]/90 to-[var(--color-bg-elevated)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10",
        compact
          ? "min-w-0 max-w-[7.5rem] shrink-0 px-2.5 py-1.5 sm:max-w-none sm:px-3 sm:py-2"
          : "min-w-[148px] px-4 py-2.5",
        className,
      )}
    >
      <span
        className={cn(
          "eyebrow block text-[var(--color-text-muted)]",
          compact && "!text-[10px] !tracking-[0.12em]",
        )}
      >
        {t("balanceLabel")}
      </span>
      <strong
        className={cn(
          "numeric mt-0.5 block font-bold text-white",
          compact ? "text-sm" : "text-base",
        )}
      >
        {formatMoney(displayBalance)}
      </strong>
    </div>
  );
}
