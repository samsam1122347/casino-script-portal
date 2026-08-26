"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Activity, CircleDollarSign } from "lucide-react";
import { createLiveBet, seedLiveBets, type LiveBet } from "@/lib/data/liveBets";
import { env } from "@/lib/env";
import { formatMoney, formatMultiplier } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  getFrameMultiplier,
  liveAuthoritativeMultiplier,
  useCrashState,
  type Phase,
} from "@/lib/game/crashStore";
import { crashPrivateChannelName, getEcho } from "@/lib/realtime/echoClient";

type RealLiveBet = {
  id: string;
  crash_round_id: string;
  player: string;
  stake_minor: number;
  status: "open" | "cashed_out" | "lost" | "refunded";
  round_phase: "betting" | "running" | "busted" | null;
  cashout_multiplier: number | null;
  payout_minor: number | null;
  created_at: string | null;
};

type FeedRow = {
  id: string;
  rawId: string;
  source: "real" | "house" | "you";
  player: string;
  stakeUsd: number;
  payoutUsd: number | null;
  multiplier: number | null;
  status: "open" | "cashed_out" | "lost" | "refunded";
  roundPhase: "betting" | "running" | "busted" | null;
  emittedAt: number;
};

type CrashBetActionPayload = {
  action?: unknown;
  bet?: unknown;
  emitted_at?: unknown;
};

const REAL_LIMIT = 80;
const HOUSE_FEED_SIZE = 80;
const HOUSE_INITIAL_BURST = 4;
const VISIBLE_FEED_SIZE = REAL_LIMIT + HOUSE_FEED_SIZE;
const RESYNC_MS = 15000;
const HOUSE_TICK_MS = 2600;

function nextHouseDelayMs(): number {
  const roll = Math.random();
  if (roll < 0.25) return 350 + Math.floor(Math.random() * 450);
  if (roll < 0.75) return 900 + Math.floor(Math.random() * 1200);
  return 2200 + Math.floor(Math.random() * 2200);
}

function roundPhaseFromCrashPhase(phase: Phase): FeedRow["roundPhase"] {
  if (phase === "preparing") return "betting";
  if (phase === "running") return "running";
  return "busted";
}

function numberFromUnknown(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseRealBet(row: unknown): RealLiveBet | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const stake = numberFromUnknown(r.stake_minor);
  if (
    typeof r.id !== "string" ||
    typeof r.crash_round_id !== "string" ||
    typeof r.player !== "string" ||
    stake === null
  ) {
    return null;
  }

  const status =
    r.status === "cashed_out" ||
    r.status === "lost" ||
    r.status === "refunded" ||
    r.status === "open"
      ? r.status
      : "open";
  const roundPhase =
    r.round_phase === "betting" ||
    r.round_phase === "running" ||
    r.round_phase === "busted"
      ? r.round_phase
      : null;
  const payout = numberFromUnknown(r.payout_minor);

  return {
    id: r.id,
    crash_round_id: r.crash_round_id,
    player: r.player,
    stake_minor: Math.max(0, Math.floor(stake)),
    status,
    round_phase: roundPhase,
    cashout_multiplier: numberFromUnknown(r.cashout_multiplier),
    payout_minor: payout !== null ? Math.max(0, Math.floor(payout)) : null,
    created_at: typeof r.created_at === "string" ? r.created_at : null,
  };
}

function realToFeedRow(row: RealLiveBet): FeedRow {
  return {
    id: `real-${row.id}`,
    rawId: row.id,
    source: "real",
    player: row.player,
    stakeUsd: row.stake_minor / 100,
    payoutUsd: row.status === "lost" ? 0 : row.payout_minor !== null ? row.payout_minor / 100 : null,
    multiplier: row.cashout_multiplier,
    status: row.status,
    roundPhase: row.round_phase,
    emittedAt: row.created_at ? Date.parse(row.created_at) || Date.now() : Date.now(),
  };
}

function houseToFeedRow(row: LiveBet, phase: Phase): FeedRow {
  const roundPhase = roundPhaseFromCrashPhase(phase);
  const open = phase !== "crashed";

  return {
    id: `house-${row.id}`,
    rawId: row.id,
    source: "house",
    player: row.username,
    stakeUsd: row.betUsd,
    payoutUsd: open ? null : row.payoutUsd,
    multiplier: open ? null : row.multiplier ?? null,
    status: open ? "open" : row.status === "won" ? "cashed_out" : "lost",
    roundPhase,
    emittedAt: row.emittedAt,
  };
}

function statusLabel(row: FeedRow): string {
  if (row.status === "cashed_out") return "Cashed out";
  if (row.status === "lost") return "Busted";
  if (row.status === "refunded") return "Refunded";
  if (row.roundPhase === "betting") return "Incoming";
  if (row.roundPhase === "running") return "Active";
  return "Running";
}

function ResultCell({ row, liveMultiplier }: { row: FeedRow; liveMultiplier: number }) {
  if (row.status === "open") {
    const payout = row.stakeUsd * liveMultiplier;
    return (
      <span className="inline-flex items-center gap-2 text-[var(--color-brand)]">
        <span className="numeric rounded-lg bg-[var(--color-brand)]/10 px-2 py-1 text-[11px] font-extrabold tabular-nums ring-1 ring-[var(--color-brand)]/25">
          {formatMultiplier(liveMultiplier)}
        </span>
        <strong className="numeric tabular-nums">
          {formatMoney(payout)}
        </strong>
      </span>
    );
  }

  if (row.status === "cashed_out" && row.multiplier !== null) {
    return (
      <span className="inline-flex items-center gap-2 text-[var(--color-brand)]">
        <span className="numeric rounded-lg bg-[var(--color-brand)]/10 px-2 py-1 text-[11px] font-extrabold tabular-nums ring-1 ring-[var(--color-brand)]/25">
          {formatMultiplier(row.multiplier)}
        </span>
        <strong className="numeric tabular-nums">
          +{formatMoney(row.payoutUsd ?? 0)}
        </strong>
      </span>
    );
  }

  if (row.status === "refunded") {
    return <span className="text-white/55">{formatMoney(row.payoutUsd ?? row.stakeUsd)}</span>;
  }

  return <span className="numeric font-extrabold tabular-nums text-[var(--color-pink)]">$0.00</span>;
}

export function CrashLiveBetsTable() {
  const locale = useLocale();
  const phase = useCrashState((s) => s.phase);
  const currentRound = useCrashState((s) => s.currentRound);
  const pending = useCrashState((s) => s.pending);
  const active = useCrashState((s) => s.active);
  const storeMultiplier = useCrashState((s) => s.multiplier);
  const [realRows, setRealRows] = useState<RealLiveBet[]>([]);
  const [houseRows, setHouseRows] = useState<LiveBet[]>(() =>
    seedLiveBets(HOUSE_INITIAL_BURST, "en"),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [displayMultiplier, setDisplayMultiplier] = useState(1);

  function upsertRealBet(row: RealLiveBet): void {
    setRealRows((prev) => {
      const without = prev.filter((existing) => existing.id !== row.id);
      return [row, ...without].slice(0, REAL_LIMIT);
    });
    setLastUpdatedAt(Date.now());
  }

  const currentRoundId = currentRound?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setHouseRows(seedLiveBets(HOUSE_INITIAL_BURST, locale));
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [currentRoundId, locale]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function resync(): Promise<void> {
      try {
        const res = await fetch(`/api/games/crash/live-bets?limit=${REAL_LIMIT}`, {
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const payload: unknown = await res.json().catch(() => null);
        if (cancelled || !res.ok || !payload || typeof payload !== "object") {
          return;
        }
        const bets = Array.isArray((payload as { bets?: unknown }).bets)
          ? (payload as { bets: unknown[] }).bets
          : [];
        const parsed = bets
          .map(parseRealBet)
          .filter((row): row is RealLiveBet => row !== null);
        setRealRows((prev) => {
          const merged = new Map<string, RealLiveBet>();
          for (const row of parsed) merged.set(row.id, row);
          for (const row of prev) {
            if (!merged.has(row.id)) merged.set(row.id, row);
          }
          return Array.from(merged.values()).slice(0, REAL_LIMIT);
        });
        setLastUpdatedAt(Date.now());
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    function schedule(): void {
      if (cancelled) return;
      timer = window.setTimeout(async () => {
        if (!document.hidden) {
          await resync();
        }
        schedule();
      }, RESYNC_MS);
    }

    void resync();
    schedule();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!env.NEXT_PUBLIC_REALTIME_ENABLED) return;
    const echo = getEcho();
    if (!echo) return;

    const channelName = crashPrivateChannelName(env.NEXT_PUBLIC_TENANT_SLUG);
    const channel = echo.private(channelName);

    channel.listen(".CrashBetAction", (payload: CrashBetActionPayload) => {
      const row = parseRealBet(payload.bet);
      if (row) upsertRealBet(row);
    });

    return () => {
      channel.stopListening(".CrashBetAction");
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    let burst = 0;

    function tick(): void {
      if (!document.hidden) {
        setHouseRows((prev) =>
          [createLiveBet(locale), ...prev].slice(0, HOUSE_FEED_SIZE),
        );
        burst += 1;
      }
      timer = window.setTimeout(
        tick,
        burst < 12 ? nextHouseDelayMs() : HOUSE_TICK_MS + Math.floor(Math.random() * 1800),
      );
    }

    timer = window.setTimeout(tick, 700 + Math.floor(Math.random() * 900));
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [locale]);

  useEffect(() => {
    let frame = 0;
    let last = 0;

    const tick = (): void => {
      const next =
        phase === "running"
          ? Math.max(1, liveAuthoritativeMultiplier(), getFrameMultiplier())
          : Math.max(1, storeMultiplier);
      if (Math.abs(next - last) >= 0.005) {
        last = next;
        setDisplayMultiplier(next);
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, storeMultiplier]);

  const rows = useMemo(() => {
    const currentRoundReal = currentRoundId !== null
      ? realRows.filter((row) => row.crash_round_id === currentRoundId)
      : realRows;
    const real = currentRoundReal.map(realToFeedRow);
    const house = houseRows.map((row) => houseToFeedRow(row, phase));
    const personalBet = active ?? pending;
    const personalRoundId =
      active?.roundId ?? pending?.roundId ?? currentRoundId ?? "local";
    const personal =
      personalBet !== null
        ? [
            {
              id: `you-${personalRoundId}`,
              rawId: String(personalRoundId),
              source: "you" as const,
              player: "You",
              stakeUsd:
                typeof personalBet.betMinor === "number"
                  ? personalBet.betMinor / 100
                  : personalBet.betUsd,
              payoutUsd: null,
              multiplier: null,
              status: "open" as const,
              roundPhase: roundPhaseFromCrashPhase(phase),
              emittedAt: Number.MAX_SAFE_INTEGER,
            },
          ]
        : [];

    return [...personal, ...real, ...house]
      .filter((row, index, all) => {
        if (row.source !== "real") return true;
        return all.findIndex((candidate) => candidate.source === "real" && candidate.rawId === row.rawId) === index;
      })
      .sort((a, b) => {
        if (a.source === "you" && b.source !== "you") return -1;
        if (b.source === "you" && a.source !== "you") return 1;
        if (Math.abs(b.stakeUsd - a.stakeUsd) > 0.001) return b.stakeUsd - a.stakeUsd;
        return b.emittedAt - a.emittedAt;
      })
      .slice(0, VISIBLE_FEED_SIZE);
  }, [active, currentRoundId, houseRows, pending, phase, realRows]);

  return (
    <section className="dashboard-shell mt-3 min-w-0 overflow-hidden sm:mt-4">
      <header className="flex flex-col gap-3 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/25">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white">
              Live bets
            </h2>
            <p className="text-sm font-semibold text-white/45">
              Current-round bets, sorted by amount and updated live.
            </p>
          </div>
        </div>
      </header>

      <div className="max-h-[34rem] overflow-y-auto">
        <div className="sticky top-0 z-10 hidden grid-cols-[minmax(0,1.2fr)_0.75fr_0.85fr_1fr] gap-3 border-b border-white/[0.06] bg-[#07101d]/95 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/38 backdrop-blur md:grid">
          <span>Player</span>
          <span>Bet</span>
          <span>Status</span>
          <span className="text-right">Result</span>
        </div>

        <ul className="divide-y divide-white/[0.055]" role="list">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={cn(
                "grid gap-2 px-4 py-3 transition-colors sm:px-5 md:grid-cols-[minmax(0,1.2fr)_0.75fr_0.85fr_1fr] md:items-center md:gap-3",
                row.source === "you"
                  ? "bg-[var(--color-brand)]/[0.08]"
                  : index === 0 && "bg-[var(--color-brand)]/[0.035]",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold uppercase ring-1",
                    row.source === "you"
                      ? "bg-[var(--color-brand)]/15 text-[var(--color-brand)] ring-[var(--color-brand)]/30"
                      : "bg-white/[0.06] text-white/80 ring-white/[0.1]",
                  )}
                >
                  {row.player.slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-white">
                    {row.player}
                  </p>
                </div>
              </div>

              <div className="numeric text-sm font-extrabold tabular-nums text-white/85">
                {formatMoney(row.stakeUsd)}
              </div>

              <div>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ring-1",
                    row.status === "cashed_out" &&
                      "bg-[var(--color-brand)]/10 text-[var(--color-brand)] ring-[var(--color-brand)]/25",
                    row.status === "lost" &&
                      "bg-[var(--color-pink)]/10 text-[var(--color-pink)] ring-[var(--color-pink)]/25",
                    row.status === "open" &&
                      "bg-white/[0.06] text-white/65 ring-white/[0.12]",
                    row.status === "refunded" &&
                      "bg-white/[0.04] text-white/45 ring-white/[0.1]",
                  )}
                >
                  {statusLabel(row)}
                </span>
              </div>

              <div className="numeric text-sm font-extrabold tabular-nums md:text-right">
                <ResultCell row={row} liveMultiplier={displayMultiplier} />
              </div>
            </li>
          ))}
        </ul>

        {rows.length === 0 && !isLoading ? (
          <div className="px-4 py-10 text-center text-sm font-semibold text-white/45">
            No bets have been placed yet.
          </div>
        ) : null}
      </div>

      <footer className="flex flex-col gap-2 border-t border-white/[0.06] px-4 py-3 text-[11px] font-semibold text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="inline-flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4" aria-hidden />
          Busted bets settle to $0.00. Cashed-out bets show the paid multiplier.
        </span>
        <span>
          {isLoading
            ? "Loading..."
            : lastUpdatedAt !== null
              ? `Updated ${new Date(lastUpdatedAt).toLocaleTimeString()}`
              : "Live"}
        </span>
      </footer>
    </section>
  );
}
