"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Rocket,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatMoney, formatMultiplier } from "@/lib/format";
import {
  crashSoundsMuted,
  playCrashSound,
  setCrashSoundsMuted,
  unlockCrashSounds,
} from "@/lib/game/crashSounds";
import {
  cancelBet,
  manualCashOut,
  queueBet,
  queueRealCrashBet,
  useCrashState,
} from "@/lib/game/crashStore";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { toast } from "@/lib/toast-bus";
import { useCrashPublicState } from "@/lib/game/useCrashPublicState";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const AUTO_CO_MIN = 1.01;
const AUTO_CO_MAX = 1000;

/** Keeps one decimal point; strips other junk so users can type `1.3` without coercion bugs. */
function sanitizeAutoCashoutInput(raw: string) {
  let s = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s =
      s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  return s;
}

/**
 * Numeric multiplier for profit + place-bet. Trailing `.` uses the digits before the dot
 * so `1.` still behaves like `1` until `1.3` is complete (avoids clamp-to-min on every keystroke).
 */
function multiplierFromAutoCashoutInput(s: string) {
  const clean = sanitizeAutoCashoutInput(s);
  if (clean === "" || clean === ".") {
    return 2;
  }
  const base = clean.endsWith(".") ? clean.slice(0, -1) : clean;
  const n = Number(base);
  if (!Number.isFinite(n)) {
    return 2;
  }
  return clamp(n, AUTO_CO_MIN, AUTO_CO_MAX);
}

/** Stop accepting bets this many ms before server `betting_closes_at` to avoid 409 races. */
const BETTING_CLOSE_MARGIN_MS = 450;
/** Show "Closing soon" when this many ms or less remain (after margin). */
const BETTING_CLOSING_SOON_MS = 3000;

export function BetCard({
  realMoney = false,
}: {
  /** Wallet-backed staking via Laravel when true (Crash page derives from session + env). */
  realMoney?: boolean;
}) {
  const t = useTranslations("crashGame");

  const mode = useCrashState((s) => s.mode);
  const minorBal = useCrashState((s) => s.realBalanceMinor);

  const practiceBalance = useCrashState((s) => s.practiceBalance);

  const balance =
    realMoney && mode === "real" ? Math.max(0, minorBal) / 100 : practiceBalance;
  const pending = useCrashState((s) => s.pending);
  const active = useCrashState((s) => s.active);
  const phase = useCrashState((s) => s.phase);
  const liveMultiplier = useCrashState((s) => s.multiplier);
  const cashoutInFlight = useCrashState((s) => s.cashoutInFlight);
  const authorityBetWindow = useCrashState((s) => s.authorityBetWindow);

  const [bet, setBet] = useState(10);
  /** Controlled text so partial decimals like `1.` / `1.3` are not snapped to a number each keystroke. */
  const [autoCashoutInput, setAutoCashoutInput] = useState("2");
  const autoCashout = multiplierFromAutoCashoutInput(autoCashoutInput);
  // Mute state lives in localStorage, which is unavailable during SSR. Render
  // unmuted on the server (and the first client paint) and reconcile from
  // storage after mount so SSR HTML always matches client hydration.
  const [soundOff, setSoundOff] = useState(false);

  useEffect(() => {
    // Reconcile mute preference from localStorage after hydration. The lint
    // rule guards against cascading effects, but a one-shot mount-time sync
    // from an external store (no React deps) is exactly the SSR-safe pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOff(crashSoundsMuted());
  }, []);

  const lastBetToastRef = useRef<{ message: string; at: number } | null>(null);

  // Tenant stake limits — only meaningful for real-money play. Practice mode
  // is intentionally left unconstrained.
  const isRealMoney = realMoney && mode === "real";
  const { limits } = useCrashPublicState(isRealMoney);

  /** Wall clock for betting cutoff (from effects — avoids `Date.now()` in render per react-hooks/purity). */
  const [wallClockMs, setWallClockMs] = useState(0);
  useLayoutEffect(() => {
    // One sync to wall time after phase/window updates (same pattern as mute reconcile).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWallClockMs(Date.now());
  }, [phase, authorityBetWindow, isRealMoney]);
  useEffect(() => {
    if (!isRealMoney || phase !== "preparing" || !authorityBetWindow) return;
    const id = window.setInterval(() => {
      setWallClockMs(Date.now());
    }, 500);
    return () => window.clearInterval(id);
  }, [isRealMoney, phase, authorityBetWindow]);
  const minBet =
    isRealMoney && limits?.min_bet_minor != null
      ? limits.min_bet_minor / 100
      : null;
  const maxBet =
    isRealMoney && limits?.max_bet_minor != null
      ? limits.max_bet_minor / 100
      : null;

  let limitError: string | null = null;
  if (minBet != null && bet > 0 && bet < minBet) {
    limitError = t("betBelowMin", { min: formatMoney(minBet) });
  } else if (maxBet != null && bet > maxBet) {
    limitError = t("betAboveMax", { max: formatMoney(maxBet) });
  }

  const profit = +(bet * autoCashout - bet).toFixed(2);

  const nowMs = wallClockMs;
  const bw = authorityBetWindow;
  const wallClockLocksBetting =
    isRealMoney &&
    phase === "preparing" &&
    bw !== null &&
    nowMs >= bw.closesMs - BETTING_CLOSE_MARGIN_MS;

  const msRemainBeforeCutoff =
    bw !== null ? bw.closesMs - nowMs - BETTING_CLOSE_MARGIN_MS : Number.POSITIVE_INFINITY;
  const closingSoon =
    isRealMoney &&
    phase === "preparing" &&
    bw !== null &&
    !wallClockLocksBetting &&
    msRemainBeforeCutoff <= BETTING_CLOSING_SOON_MS &&
    msRemainBeforeCutoff > 0;

  /** Round is flying or busted — not the betting phase. */
  const phaseLocksBetting = isRealMoney && phase !== "preparing";

  const bettingOpen = phase === "preparing" && !wallClockLocksBetting;

  const canBet =
    bettingOpen &&
    balance > 0 &&
    bet > 0 &&
    bet <= balance &&
    limitError === null;

  const toggleSound = useCallback(() => {
    unlockCrashSounds();
    const currentlyMuted = crashSoundsMuted();
    const newMuted = !currentlyMuted;
    setCrashSoundsMuted(newMuted);
    setSoundOff(newMuted);
    if (!newMuted) {
      playCrashSound("tickSoft");
    }
  }, []);

  async function handlePlace() {
    unlockCrashSounds();
    if (!canBet) {
      return;
    }
    if (realMoney) {
      const stakeMinor = Math.round(bet * 100);
      const auto =
        autoCashout >= AUTO_CO_MIN ? autoCashout : null;
      const result = await queueRealCrashBet(stakeMinor, auto);
      if (!result.ok && result.reason && result.reason !== "busy") {
        const msg = result.reason;
        const prev = lastBetToastRef.current;
        const t0 = Date.now();
        if (
          prev &&
          prev.message === msg &&
          t0 - prev.at < 2500
        ) {
          return;
        }
        lastBetToastRef.current = { message: msg, at: t0 };
        toast({
          variant: "destructive",
          title: t("betFailedTitle"),
          description: msg,
        });
      }
      return;
    }
    queueBet(bet, autoCashout);
  }

  async function handleCancel() {
    unlockCrashSounds();
    const result = await cancelBet();
    if (
      !result.ok &&
      result.reason &&
      result.reason !== "no-pending"
    ) {
      toast({
        variant: "destructive",
        title: t("betFailedTitle"),
        description: result.reason,
      });
    }
  }

  async function handleCashOut() {
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
  }

  // ──────────────────── primary CTA ────────────────────
  let primary: React.ReactNode;

  if (active && phase === "running") {
    const projectedPayout = +(active.betUsd * liveMultiplier).toFixed(2);
    primary = (
      <Button
        block
        size="xl"
        variant="primary"
        type="button"
        onClick={handleCashOut}
        disabled={cashoutInFlight}
        className="h-14 animate-[cashPulse_1.4s_ease-in-out_infinite] bg-gradient-to-r from-[var(--color-orange)] via-[#ff6e2c] to-[var(--color-pink)] text-white shadow-[0_0_38px_-10px_rgba(255,110,44,0.6)] disabled:animate-none disabled:opacity-70"
      >
        <span className="flex w-full items-center justify-between gap-3">
          <span className="font-extrabold uppercase tracking-[0.06em]">
            {cashoutInFlight ? t("cashingOut") : t("cashOutNow")}
          </span>
          <span className="numeric tabular-nums font-extrabold">
            {formatMoney(projectedPayout)} · {formatMultiplier(liveMultiplier)}
          </span>
        </span>
      </Button>
    );
  } else if (pending) {
    primary = (
      <Button
        block
        size="xl"
        variant="ghost"
        type="button"
        onClick={handleCancel}
        className="h-[3.25rem] border border-white/[0.09] bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
      >
        {t("cancelBetWaiting")}
      </Button>
    );
  } else if (phaseLocksBetting) {
    primary = (
      <Button
        block
        size="xl"
        variant="ghost"
        type="button"
        disabled
        className="h-[3.25rem] cursor-not-allowed border border-white/[0.08] bg-white/[0.025] !opacity-100"
      >
        <span className="flex w-full min-w-0 items-center justify-between gap-3">
          <span className="font-extrabold tracking-tight text-white/65">
            {t("bettingClosed")}
          </span>
          <span className="numeric shrink-0 rounded-md bg-black/30 px-2 py-1 text-[12px] font-extrabold tabular-nums text-[var(--color-orange)]">
            {formatMultiplier(liveMultiplier)}
          </span>
        </span>
      </Button>
    );
  } else if (wallClockLocksBetting) {
    primary = (
      <Button
        block
        size="xl"
        variant="ghost"
        type="button"
        disabled
        title={t("phaseBettingWaitServerHint")}
        className="h-[3.25rem] cursor-not-allowed border border-sky-400/30 bg-sky-500/[0.08] font-extrabold tracking-tight text-sky-100 !opacity-100"
      >
        {t("phaseBettingSyncShort")}
      </Button>
    );
  } else if (balance <= 0) {
    primary = (
      <Button
        block
        asChild
        size="xl"
        variant="primary"
        className="h-[3.25rem]"
      >
        <Link href={ROUTES.deposit}>{t("depositToPlay")}</Link>
      </Button>
    );
  } else {
    primary = (
      <Button
        block
        size="xl"
        className="group h-14 gap-2.5"
        variant="primary"
        type="button"
        disabled={!canBet}
        onClick={handlePlace}
      >
        <Rocket
          className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:rotate-12"
          aria-hidden
          strokeWidth={2.5}
        />
        <span className="font-extrabold tracking-tight">
          {bettingOpen ? t("placeBet") : t("bettingClosed")}
        </span>
        <span className="numeric ml-auto shrink-0 rounded-md bg-black/25 px-2 py-1 text-[12px] font-extrabold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
          {formatMoney(bet)}
        </span>
      </Button>
    );
  }

  const balanceHint = balance > 0
    ? t("balanceHint", { balance: formatMoney(balance) })
    : t("balanceEmptyHint");
  const armedAutoTarget = active?.autoTarget ?? pending?.autoTarget ?? null;
  const showAutoCashoutStatus =
    armedAutoTarget !== null && armedAutoTarget > 1.01 && armedAutoTarget < 1000;
  const autoCashoutProgress =
    active && showAutoCashoutStatus
      ? clamp((liveMultiplier / armedAutoTarget) * 100, 0, 100)
      : 0;

  const inputsDisabled =
    Boolean(active) ||
    Boolean(pending) ||
    balance <= 0 ||
    phaseLocksBetting ||
    wallClockLocksBetting;

  // Phase status — distinct hues for wall-clock vs phase-only state. Rendered as
  // a slim single line (no boxed pill) to keep the card calm.
  const phaseStatus =
    phase === "running"
      ? {
          label: t("phaseRoundRunning"),
          detail: formatMultiplier(liveMultiplier),
          dot: "bg-[var(--color-orange)] shadow-[0_0_10px_rgba(255,122,50,0.6)] animate-pulse",
          text: "text-[var(--color-orange)]",
        }
      : phase === "crashed"
        ? {
            label: t("phaseRoundEnded"),
            detail: formatMultiplier(liveMultiplier),
            dot: "bg-[var(--color-pink)]",
            text: "text-[var(--color-pink)]",
          }
        : wallClockLocksBetting
          ? {
              label: t("phaseBettingSyncShort"),
              detail: null,
              dot: "bg-sky-400/90 shadow-[0_0_10px_rgba(56,189,248,0.45)]",
              text: "text-sky-200",
            }
          : closingSoon
            ? {
                label: t("phaseBettingClosing"),
                detail: null,
                dot: "bg-amber-300/90 shadow-[0_0_10px_rgba(253,224,71,0.5)] animate-pulse",
                text: "text-amber-100/90",
              }
            : {
                label: t("phaseBettingOpen"),
                detail: null,
                dot: "bg-[var(--color-brand)] shadow-[0_0_10px_rgba(0,240,128,0.55)]",
                text: "text-[var(--color-brand)]",
              };

  const quickStakes = [10, 25, 50, 100];

  const fieldShell =
    "flex min-w-0 items-center gap-1.5 rounded-xl border border-white/[0.07] bg-[#070c18] px-2 transition-colors focus-within:border-[var(--color-brand)]/45";
  const fieldLabel =
    "block text-[11px] font-extrabold uppercase tracking-[0.1em] text-white/55";
  const sideBtn =
    "numeric grid h-8 sm:h-9 min-w-[36px] sm:min-w-[40px] shrink-0 place-items-center rounded-lg bg-white/[0.05] text-xs sm:text-sm font-extrabold text-white/80 transition-colors hover:bg-white/[0.1] disabled:opacity-40";

  return (
    <aside
      className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#101729] to-[#0a0f1e] shadow-[var(--shadow-chrome)] sm:rounded-3xl"
      onPointerDownCapture={() => {
        unlockCrashSounds();
      }}
    >
      <style>{`
        @keyframes cashPulse {
          0%, 100% { transform: translateZ(0) scale(1); box-shadow: 0 0 32px -12px rgba(255,110,44,0.55); }
          50% { transform: translateZ(0) scale(1.012); box-shadow: 0 0 52px -8px rgba(255,110,44,0.85); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="cashPulse"] { animation: none !important; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-brand)]/40 to-transparent"
        aria-hidden
      />

      {/* ── Header: title · wallet · sound ── */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3 sm:px-5 sm:pt-4">
        <p className="truncate text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">
          {t("betSidebarTitle")}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "numeric rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold tabular-nums",
              balance > 0
                ? "bg-[var(--color-brand)]/[0.1] text-[var(--color-brand)]"
                : "bg-amber-400/[0.12] text-amber-200",
            )}
          >
            {balanceHint}
          </span>
          <button
            type="button"
            onClick={() => toggleSound()}
            className={cn(
              "grid size-7 sm:size-8 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/55",
              soundOff
                ? "bg-white/[0.04] text-white/40 hover:bg-white/[0.08]"
                : "bg-[var(--color-brand)]/12 text-[var(--color-brand)] hover:bg-[var(--color-brand)]/18",
            )}
            aria-pressed={!soundOff}
            aria-label={soundOff ? t("soundMutedAria") : t("soundOnAria")}
            title={soundOff ? t("soundUnmute") : t("soundMute")}
          >
            {soundOff ? (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            ) : (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* ── Primary CTA at Top (visible right below rocket canvas) ── */}
      <div className="px-3.5 pt-2.5 sm:px-5 sm:pt-3">
        {primary}
      </div>

      {/* ── Phase line (slim, no box) ── */}
      <div
        className="mx-3.5 mt-2 flex items-center justify-between gap-2 rounded-lg bg-white/[0.025] px-3 py-1.5 sm:mx-5 sm:mt-2.5"
        role="status"
      >
        <span className="flex items-center gap-2">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", phaseStatus.dot)}
            aria-hidden
          />
          <span
            className={cn(
              "text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.1em]",
              phaseStatus.text,
            )}
          >
            {phaseStatus.label}
          </span>
        </span>
        {phaseStatus.detail ? (
          <span
            className={cn(
              "numeric text-[12px] sm:text-[13px] font-extrabold tabular-nums",
              phaseStatus.text,
            )}
          >
            {phaseStatus.detail}
          </span>
        ) : null}
      </div>

      {/* ── Armed auto cash-out (slim) ── */}
      {showAutoCashoutStatus ? (
        <div className="mx-3.5 mt-2 space-y-1.5 rounded-lg bg-[var(--color-brand)]/[0.06] px-3 py-1.5 sm:mx-5 sm:mt-2.5 sm:py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-brand)]/90">
              {active ? t("autoCashoutArmed") : t("autoCashoutQueued")}
            </span>
            <span className="numeric text-[11px] font-extrabold tabular-nums text-white/80">
              {active
                ? t("autoCashoutProgress", {
                    current: formatMultiplier(liveMultiplier),
                    target: formatMultiplier(armedAutoTarget),
                  })
                : t("autoCashoutTriggerAt", {
                    target: formatMultiplier(armedAutoTarget),
                  })}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <span
              className="block h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-150"
              style={{ width: `${autoCashoutProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2.5 px-3.5 pb-3 pt-2.5 sm:space-y-4 sm:px-5 sm:pb-5 sm:pt-4">
        {/* ── Bet amount ── */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="bet" className={fieldLabel}>
            {t("betAmountLabel")}
          </label>
          <div className={fieldShell}>
            <Input
              id="bet"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]*[.,]?[0-9]*"
              value={bet}
              disabled={inputsDisabled}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
                if (raw === "") {
                  setBet(0);
                  return;
                }
                const v = Number(raw);
                if (Number.isFinite(v)) {
                  setBet(clamp(v, 0, balance || Infinity));
                }
              }}
              className="numeric h-10 min-w-0 flex-1 border-0 bg-transparent px-1.5 text-sm font-extrabold tabular-nums focus:border-transparent focus:ring-0 sm:h-12 sm:text-base"
            />
            <span className="numeric text-xs sm:text-sm font-bold text-white/35">$</span>
            <button
              type="button"
              disabled={inputsDisabled}
              className={sideBtn}
              onClick={() =>
                setBet((value) => Math.max(0, +(value / 2).toFixed(2)))
              }
              aria-label={t("halveBetAria")}
            >
              ½
            </button>
            <button
              type="button"
              disabled={inputsDisabled}
              className={sideBtn}
              onClick={() =>
                setBet((value) =>
                  clamp(+(value * 2).toFixed(2), 0, balance || Infinity),
                )
              }
              aria-label={t("doubleBetAria")}
            >
              2×
            </button>
          </div>

          {/* Quick stake buttons - ALWAYS 1 line */}
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            {quickStakes.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={inputsDisabled}
                onClick={() => {
                  unlockCrashSounds();
                  setBet(clamp(amount, 0, balance || Infinity));
                  playCrashSound("tickSoft");
                }}
                className={cn(
                  "numeric h-7 sm:h-8 min-w-0 truncate rounded-lg px-0.5 sm:px-1 text-[11px] sm:text-[12px] font-extrabold tabular-nums transition-colors disabled:opacity-40",
                  bet === amount
                    ? "bg-[var(--color-brand)]/15 text-[var(--color-brand)] ring-1 ring-inset ring-[var(--color-brand)]/45"
                    : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08]",
                )}
              >
                {formatMoney(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Auto cash-out ── */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="auto" className={fieldLabel}>
            {t("autoCashoutLabel")}
          </label>
          <div className={fieldShell}>
            <Input
              id="auto"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]*[.,]?[0-9]*"
              value={autoCashoutInput}
              disabled={inputsDisabled}
              onChange={(e) => {
                setAutoCashoutInput(sanitizeAutoCashoutInput(e.target.value));
              }}
              onBlur={() => {
                const v = multiplierFromAutoCashoutInput(autoCashoutInput);
                setAutoCashoutInput(String(v));
              }}
              className="numeric h-10 min-w-0 flex-1 border-0 bg-transparent px-1.5 text-sm font-extrabold tabular-nums focus:border-transparent focus:ring-0 sm:h-12 sm:text-base"
            />
            <span className="numeric text-xs sm:text-sm font-bold text-white/35">×</span>
            <button
              type="button"
              aria-label={t("decreaseAutoCashoutAria")}
              disabled={inputsDisabled}
              className={sideBtn}
              onClick={() =>
                setAutoCashoutInput((prev) =>
                  String(
                    clamp(
                      +(multiplierFromAutoCashoutInput(prev) - 0.5).toFixed(2),
                      AUTO_CO_MIN,
                      AUTO_CO_MAX,
                    ),
                  ),
                )
              }
            >
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              aria-label={t("increaseAutoCashoutAria")}
              disabled={inputsDisabled}
              className={sideBtn}
              onClick={() =>
                setAutoCashoutInput((prev) =>
                  String(
                    clamp(
                      +(multiplierFromAutoCashoutInput(prev) + 0.5).toFixed(2),
                      AUTO_CO_MIN,
                      AUTO_CO_MAX,
                    ),
                  ),
                )
              }
            >
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* ── Profit (inline, no box) ── */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-2 sm:pt-3">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.1em] text-white/45">
            {t("profitOnWinLabel")}
          </span>
          <strong className="numeric text-[13px] sm:text-[15px] font-extrabold tabular-nums text-[var(--color-brand)]">
            {formatMoney(profit)}
          </strong>
        </div>

        {limitError ? (
          <p
            className="text-center text-[11px] font-bold leading-snug text-[var(--color-pink)]"
            role="alert"
          >
            {limitError}
          </p>
        ) : null}

        {pending && !active ? (
          <p className="text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-white/45">
            {t("waitingForRound")}
          </p>
        ) : null}

        <div className="flex justify-center pt-0.5">
          <Link
            href={ROUTES.transactions}
            className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/35 underline-offset-4 transition-colors hover:text-white/65 hover:underline"
          >
            {t("myBetsLink")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
