"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { CrashVideoStageLazy } from "@/components/game/CrashVideoStageLazy";
import { MultiplierTicker } from "@/components/game/MultiplierTicker";
import { FairnessVerifier } from "@/components/game/FairnessVerifier";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";
import { playCrashSound, unlockCrashSounds } from "@/lib/game/crashSounds";
import {
  getCrashState,
  hydrateAuthoritativeFromServerState,
  ingestAuthoritativeTick,
  reconcileActiveRealBet,
  restoreOpenRealBetFromServer,
} from "@/lib/game/crashStore";
import { crashPrivateChannelName, getEcho } from "@/lib/realtime/echoClient";

type WsStatus = "connecting" | "live" | "degraded";

export type CrashTickPayload = {
  multiplier?: number;
  emitted_at?: string;
  round_id?: string;
  phase?: string;
  tenant_slug?: string;
  server_ts?: number;
  server_seed_hash?: string | null;
  round_commitment_stub?: string;
  provably_fair_demo?: boolean;
  betting_opens_at?: string;
  betting_closes_at?: string;
};

function isCrashLosePhase(p: string): boolean {
  return ["crashed", "busted", "crash", "ended", "lost"].includes(p);
}

function isCrashWinPhase(p: string): boolean {
  return ["cashed_out", "cashout", "won", "payout"].includes(p);
}

function shouldPlayRoundStartSound(now: number, lastAt: number): boolean {
  return now - lastAt >= 2000;
}

export function CrashLiveSection({
  canSubscribeLive,
  /** When true (default), chart + crashStore follow `/api/site/crash-state` for everyone (guests + logged-in). Wallet/Echo stay separate. */
  applyPublicRoundState = true,
  walletBalanceMinor = 0,
}: {
  canSubscribeLive: boolean;
  applyPublicRoundState?: boolean;
  walletBalanceMinor?: number;
}) {
  const t = useTranslations("crashGame");

  const [status, setStatus] = useState<WsStatus>(() => {
    const key = env.NEXT_PUBLIC_PUSHER_APP_KEY?.trim();
    if (!canSubscribeLive || !key || !env.NEXT_PUBLIC_REALTIME_ENABLED) {
      return "degraded";
    }
    return "connecting";
  });

  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [livePulse, setLivePulse] = useState<number | null>(null);
  /** Set after first successful public crash-state poll (may be []). */
  const [recentBustedMultipliers, setRecentBustedMultipliers] =
    useState<number[]>();
  /** Live money: no active round while game should be running — engine/scheduler may be cold. */
  const [showEngineIdleBanner, setShowEngineIdleBanner] = useState(false);
  /** Wait for first public crash-state poll before mounting the chart when using server round state. */
  const [authorizeCanvas, setAuthorizeCanvas] = useState(
    () => !applyPublicRoundState,
  );

  const lastPhaseRef = useRef<string>("");
  const lastRoundAnnounceAtRef = useRef(0);
  const lastRoundIdSoundRef = useRef<string | null>(null);
  /** Wall-clock of the last authoritative tick — drives the stale-feed watchdog. */
  const lastTickAtRef = useRef(0);
  /** Throttle gate for livePulse → MultiplierTicker re-renders. */
  const lastPulseEmitRef = useRef(0);
  /** Debounce timer so a single dropped tick doesn't flap the live/degraded pill. */
  const statusDebounceRef = useRef<number | undefined>(undefined);
  /** Latest REST poll fn — invoked by the WS effect to resync immediately on reconnect. */
  const pollNowRef = useRef<(() => void) | null>(null);
  /** Mirror of `status` for the self-scheduling poll loop (avoids effect churn). */
  const statusRef = useRef<WsStatus>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  /** Apply a status change with a short grace period to absorb transient flaps. */
  const applyStatus = useCallback((next: WsStatus, immediate = false) => {
    if (statusDebounceRef.current !== undefined) {
      window.clearTimeout(statusDebounceRef.current);
      statusDebounceRef.current = undefined;
    }
    if (immediate) {
      startTransition(() => setStatus(next));
      return;
    }
    statusDebounceRef.current = window.setTimeout(() => {
      startTransition(() => setStatus(next));
    }, 750);
  }, []);

  const statusLabel =
    status === "live"
      ? t("liveConnected")
      : status === "connecting"
        ? t("connectingWs")
        : t("offlineDemo");

  const feedAnnouncement = useMemo(() => {
    const latency =
      latencyMs != null && status === "live" ? ` · ${latencyMs}ms` : "";
    const signHint = !canSubscribeLive ? ` · ${t("signInForLive")}` : "";
    return `${statusLabel}${latency}${signHint}`;
  }, [canSubscribeLive, latencyMs, status, statusLabel, t]);

  useEffect(() => {
    const key = env.NEXT_PUBLIC_PUSHER_APP_KEY?.trim();
    if (!canSubscribeLive || !key || !env.NEXT_PUBLIC_REALTIME_ENABLED) {
      applyStatus("degraded", true);
      return;
    }

    const echo = getEcho();
    if (!echo) {
      applyStatus("degraded", true);
      return;
    }

    const channelName = crashPrivateChannelName(env.NEXT_PUBLIC_TENANT_SLUG);
    const channel = echo.private(channelName);

    const failSlowly = window.setTimeout(() => {
      applyStatus("degraded", true);
    }, 8000);

    let everConnected = false;

    channel.subscribed(() => {
      window.clearTimeout(failSlowly);
      everConnected = true;
      applyStatus("live", true);
    });

    channel.error(() => {
      window.clearTimeout(failSlowly);
      applyStatus("degraded");
    });

    // pusher-js auto-reconnects the socket and resubscribes channels, but the React
    // status pill and the store would otherwise stay frozen on stale state. Track
    // the underlying connection and resync via REST on every reconnect.
    const connection = echo.connector?.pusher?.connection;
    const handleConnectionState = (states: {
      previous?: string;
      current?: string;
    }): void => {
      const current = states?.current;
      if (current === "connected") {
        applyStatus(everConnected ? "live" : "connecting", true);
        // Resync immediately — ticks missed while offline are gone for good.
        pollNowRef.current?.();
      } else if (
        current === "unavailable" ||
        current === "failed" ||
        current === "disconnected"
      ) {
        applyStatus("degraded");
      } else if (current === "connecting") {
        applyStatus("connecting");
      }
    };
    connection?.bind?.("state_change", handleConnectionState);

    channel.listen(".CrashGameTick", (payload: CrashTickPayload) => {
      lastTickAtRef.current = Date.now();
      unlockCrashSounds();

      const phaseRaw =
        typeof payload.phase === "string"
          ? payload.phase.toLowerCase().trim()
          : "";
      const rid =
        typeof payload.round_id === "string" ? payload.round_id.trim() : null;

      // Captured before lastPhaseRef is advanced below.
      const phaseChanged =
        phaseRaw !== "" && phaseRaw !== lastPhaseRef.current;

      if (rid && rid.length > 0) {
        if (lastRoundIdSoundRef.current !== rid) {
          lastRoundIdSoundRef.current = rid;
          if (
            phaseRaw === "running" ||
            phaseRaw === "betting" ||
            phaseRaw === "countdown"
          ) {
            const now = Date.now();
            if (
              shouldPlayRoundStartSound(now, lastRoundAnnounceAtRef.current)
            ) {
              lastRoundAnnounceAtRef.current = now;
              playCrashSound("roundStart");
            }
          }
        }
      }

      if (phaseChanged) {
        const prev = lastPhaseRef.current;
        lastPhaseRef.current = phaseRaw;

        if (prev !== "" && isCrashLosePhase(phaseRaw)) {
          playCrashSound("lose");
        }
        if (isCrashWinPhase(phaseRaw)) {
          playCrashSound("win");
        }
      }

      const mult = payload.multiplier;
      if (typeof mult === "number" && Number.isFinite(mult)) {
        // Ticker chips: faster refresh on a healthy WS feed for tighter 1.01+ sync.
        const pulseThrottleMs = statusRef.current === "live" ? 16 : 60;
        const nowMs = Date.now();
        if (phaseChanged || nowMs - lastPulseEmitRef.current > pulseThrottleMs) {
          lastPulseEmitRef.current = nowMs;
          setLivePulse(mult);
        }
      }

      ingestAuthoritativeTick(payload);
      const emitted = payload.emitted_at;
      if (emitted) {
        const skew = Date.now() - new Date(emitted).getTime();
        if (Number.isFinite(skew)) {
          setLatencyMs(Math.max(0, skew));
        }
      }
    });

    return () => {
      window.clearTimeout(failSlowly);
      if (statusDebounceRef.current !== undefined) {
        window.clearTimeout(statusDebounceRef.current);
        statusDebounceRef.current = undefined;
      }
      connection?.unbind?.("state_change", handleConnectionState);
      echo.leave(channelName);
    };
  }, [canSubscribeLive, applyStatus]);

  // Stale-feed watchdog when private Crash channel is expected (logged-in).
  useEffect(() => {
    if (!canSubscribeLive) return;
    const id = window.setInterval(() => {
      const last = lastTickAtRef.current;
      if (last === 0) return;
      if (Date.now() - last > 5000) {
        applyStatus("degraded");
      }
    }, 2000);
    return () => window.clearInterval(id);
  }, [canSubscribeLive, applyStatus]);

  useEffect(() => {
    if (!applyPublicRoundState) {
      startTransition(() => setShowEngineIdleBanner(false));
    }
  }, [applyPublicRoundState, canSubscribeLive]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        pollNowRef.current?.();
      }
    };
    const onCrashResync = () => {
      pollNowRef.current?.();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("crash:resync", onCrashResync);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("crash:resync", onCrashResync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let fallbackUnlock: number | undefined;
    let timer: number | undefined;

    async function poll(): Promise<void> {
      try {
        const qs = encodeURIComponent(env.NEXT_PUBLIC_TENANT_SLUG);
        const res = await fetch(`/api/site/crash-state?tenant=${qs}`, {
          cache: "no-store",
          credentials: "omit",
        });
        const payload: unknown = await res.json().catch(() => null);
        if (
          cancelled ||
          !res.ok ||
          typeof payload !== "object" ||
          payload === null
        ) {
          return;
        }
        const rb = (payload as { recent_busted_multipliers?: unknown })
          .recent_busted_multipliers;
        if (Array.isArray(rb)) {
          const nextHist = rb.filter((x): x is number => typeof x === "number");
          startTransition(() => setRecentBustedMultipliers(nextHist));
        }

        if (applyPublicRoundState) {
          const p = payload as {
            round?: unknown;
            engine_enabled?: unknown;
            game_enabled?: unknown;
            game_paused?: unknown;
          };
          const idle =
            (p.round === null || p.round === undefined) &&
            p.engine_enabled === true &&
            p.game_enabled === true &&
            p.game_paused === false;
          startTransition(() => setShowEngineIdleBanner(idle));

          hydrateAuthoritativeFromServerState(
            payload as {
              multiplier_preview?: unknown;
              server_now?: unknown;
              round?: {
                id?: unknown;
                phase?: unknown;
                betting_opens_at?: unknown;
                betting_closes_at?: unknown;
                growth_per_second?: unknown;
              } | null;
            },
          );
          if (canSubscribeLive) {
            void restoreOpenRealBetFromServer();
          }
          void reconcileActiveRealBet();
          lastTickAtRef.current = Date.now();
        }
      } catch {
        //
      }
    }

    // Expose the poll to the WS effect so a reconnect can resync immediately.
    pollNowRef.current = () => {
      if (!cancelled) void poll();
    };

    function scheduleNext(): void {
      if (cancelled) return;
      const live = statusRef.current === "live";
      let delay = applyPublicRoundState ? (live ? 5000 : 1200) : 2500;
      if (applyPublicRoundState) {
        const s = getCrashState();
        const bw = s.authorityBetWindow;
        if (s.phase === "running") {
          delay = Math.min(delay, 1000);
        }
        const pastBettingClose =
          s.phase === "preparing" &&
          bw !== null &&
          Date.now() >= bw.closesMs - 450;
        if (pastBettingClose) delay = Math.min(delay, 1500);
      }
      timer = window.setTimeout(tick, delay);
    }

    async function tick(): Promise<void> {
      // Skip background tabs — the WS feed (or the next foreground poll) catches up.
      if (!cancelled && !document.hidden) {
        await poll();
      }
      scheduleNext();
    }

    async function boot(): Promise<void> {
      if (!applyPublicRoundState) {
        await poll();
        scheduleNext();
        return;
      }
      startTransition(() => setAuthorizeCanvas(false));
      fallbackUnlock = window.setTimeout(() => {
        if (!cancelled) {
          startTransition(() => setAuthorizeCanvas(true));
        }
      }, 2800);
      await poll();
      if (fallbackUnlock !== undefined) {
        window.clearTimeout(fallbackUnlock);
        fallbackUnlock = undefined;
      }
      if (!cancelled) {
        startTransition(() => setAuthorizeCanvas(true));
      }
      scheduleNext();
    }

    void boot();

    return () => {
      cancelled = true;
      pollNowRef.current = null;
      if (fallbackUnlock !== undefined) {
        window.clearTimeout(fallbackUnlock);
      }
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [applyPublicRoundState, canSubscribeLive]);

  return (
    <div
      className="min-w-0 max-w-full overflow-x-clip"
      onPointerDownCapture={() => {
        unlockCrashSounds();
      }}
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic>
        {feedAnnouncement}
      </span>

      <div className="max-w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#0a1224] via-[#070d18] to-[#060a14] shadow-[0_28px_80px_-34px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.04] sm:rounded-3xl">
        <div className="flex min-w-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-black/35 px-2.5 py-2 sm:px-5 sm:py-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/45 sm:text-[11px] sm:tracking-[0.2em]">
            {t("roundHistoryLabel")}
          </p>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            {latencyMs != null && status === "live" ? (
              <span className="numeric hidden text-[11px] font-bold tabular-nums text-white/38 sm:inline">
                {latencyMs}ms
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] sm:px-3 sm:text-[11px] sm:tracking-[0.12em]",
                status === "live" &&
                  "border-[var(--color-brand)]/45 bg-[var(--color-brand)]/12 text-[var(--color-brand)]",
                status === "connecting" &&
                  "border-sky-400/35 bg-sky-500/[0.08] text-sky-100/95",
                status === "degraded" &&
                  "border-white/[0.1] bg-white/[0.04] text-white/55",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  status === "live" &&
                    "bg-[var(--color-brand)] shadow-[0_0_12px_rgba(0,240,128,0.45)]",
                  status === "connecting" &&
                    "animate-pulse bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.45)]",
                  status === "degraded" && "bg-white/40",
                )}
                aria-hidden
              />
              {statusLabel}
            </span>
          </div>
        </div>

        {applyPublicRoundState && showEngineIdleBanner ? (
          <div
            className="border-b border-amber-400/25 bg-amber-500/[0.07] px-3 py-2.5 sm:px-5"
            role="status"
          >
            <p className="text-center text-[11px] font-semibold leading-snug text-amber-100/95 sm:text-xs">
              {t("engineIdleBanner")}
            </p>
          </div>
        ) : null}

        <div className="relative px-1.5 pb-1.5 pt-1.5 sm:px-4 sm:pb-3 sm:pt-4">
          <MultiplierTicker
            livePulse={livePulse}
            serverHistory={
              recentBustedMultipliers === undefined ||
              recentBustedMultipliers.length === 0
                ? undefined
                : recentBustedMultipliers
            }
          />
          <FairnessVerifier enabled={applyPublicRoundState} />
        </div>

        <div className="px-1.5 pb-1.5 sm:px-4 sm:pb-4">
          {authorizeCanvas ? (
            <CrashVideoStageLazy
              useAuthoritativeFeed={applyPublicRoundState}
              initialRealBalanceMinor={walletBalanceMinor}
            />
          ) : (
            <div
              className="relative isolate flex h-[min(38svh,270px)] min-h-[200px] items-center justify-center overflow-hidden rounded-xl bg-[#04080f] shadow-[inset_0_0_0_1px_rgba(180,230,255,0.06)] sm:h-[min(52svh,430px)] sm:min-h-[360px] sm:rounded-2xl lg:min-h-[440px] xl:h-auto xl:min-h-[500px]"
              aria-busy="true"
              aria-label={t("crashChartLoading")}
            >
              <span className="text-sm font-bold text-white/35">
                {t("crashChartLoading")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
