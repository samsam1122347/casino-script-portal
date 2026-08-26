"use client";

import { useSyncExternalStore } from "react";
import { playCrashSound } from "./crashSounds";

export type Phase = "preparing" | "running" | "crashed";

export type Pending = {
  betUsd: number;
  autoTarget: number;
  /** Server crash_round_id for real-money bets; undefined for practice. */
  roundId?: string | number;
  /** Stake in minor units for real-money bets — used to refund/credit on reconcile. */
  betMinor?: number;
};
export type Active = Pending & { roundId: string | number; placedAt: number };

export type Resolved = {
  id: number;
  kind: "win" | "lose" | "close";
  bet: number;
  multiplier: number;
  payout: number;
};

export type AuthorityBetWindow = { opensMs: number; closesMs: number };
export type AuthorityRound = { id: string; phase: Phase };

type State = {
  mode: "practice" | "real";
  phase: Phase;
  multiplier: number;
  /** Latest server round identity/phase from WS or public crash-state polling. */
  currentRound: AuthorityRound | null;
  /** Server betting window — used so we never show fake 8s prep while a round is already running/wait skew. */
  authorityBetWindow: AuthorityBetWindow | null;
  pending: Pending | null;
  active: Active | null;
  /** Last resolved bet — overlay components watch and acknowledge. */
  lastResult: Resolved | null;
  /** Demo wallet — separate from real balance until ledger is wired. */
  practiceBalance: number;
  /** Minor units balance when mode === \"real\". */
  realBalanceMinor: number;
  /** True while a real-money cash-out request is awaiting the server — disables the cash-out CTA. */
  cashoutInFlight: boolean;
};

const PRACTICE_START = 1000;
/**
 * Store-emit throttle for multiplier-only updates. The smooth ~60fps display
 * (SmoothMultiplier) reads `frameMultiplier` directly via RAF and bypasses React
 * entirely — only logic consumers (projected payout, auto-cashout progress,
 * phase strip) read the throttled store value, so ~12fps is plenty and saves a
 * 5× re-render storm across every `useCrashState` subscriber.
 */
const MULT_THROTTLE_MS = 80;
/**
 * Render the live multiplier this far *behind* the freshest server sample. This
 * is the key crash-game invariant: by interpolating between two already-confirmed
 * server points we can never display a value higher than the server has reached,
 * so the round can never "snap backwards" when the bust tick arrives — and a
 * manual cash-out at the displayed value is always still valid server-side.
 */
const RENDER_BUFFER_MS = 90;
/** Hard cap on forward extrapolation when a server tick is dropped/delayed. */
const MAX_EXTRAPOLATE_MS = 120;

let state: State = {
  mode: "practice",
  phase: "preparing",
  multiplier: 1,
  currentRound: null,
  authorityBetWindow: null,
  pending: null,
  active: null,
  lastResult: null,
  practiceBalance: PRACTICE_START,
  realBalanceMinor: 0,
  cashoutInFlight: false,
};

let lastMultEmit = 0;
let roundCounter = 0;
let resultCounter = 0;
/** Server timestamp (ms) of the last applied authoritative payload — drops out-of-order ticks/polls. */
let lastAuthorityTs = 0;
/**
 * Two most recent authoritative running-phase samples. The live multiplier is
 * interpolated *between* these confirmed points (see {@link liveAuthoritativeMultiplier}),
 * never extrapolated blindly past them.
 */
type AuthSample = { mult: number; atMs: number };
let authSampleA: AuthSample | null = null;
let authSampleB: AuthSample | null = null;
let authGrowthPerSecond = 0;
/** Monotonic floor for the current running round — the visible value never dips. */
let authVisualMult = 1;
/**
 * Unthrottled per-frame multiplier for the smooth display. Written on every
 * `reportFrame` call (cheap, no `emit()`), read by SmoothMultiplier's RAF loop.
 */
let frameMultiplier = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const cb of listeners) cb();
}

function setState(patch: Partial<State>): void {
  state = { ...state, ...patch };
  emit();
}

function requestCrashResync(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("crash:resync"));
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCrashState<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export function getCrashState(): State {
  return state;
}

/**
 * Freshest per-frame multiplier — updated on every `reportFrame` without an
 * `emit()`. SmoothMultiplier polls this from its own RAF loop so the big live
 * number animates at display refresh rate without triggering React renders.
 */
export function getFrameMultiplier(): number {
  return frameMultiplier;
}

export function setCrashEconomy(
  mode: "practice" | "real",
  realBalanceMinor: number | null | undefined,
): void {
  setState({
    mode,
    realBalanceMinor: Math.max(
      0,
      typeof realBalanceMinor === "number" && Number.isFinite(realBalanceMinor)
        ? Math.floor(realBalanceMinor)
        : 0,
    ),
    ...(mode !== "real" ? { authorityBetWindow: null, currentRound: null } : {}),
  });
}

function parseRoundId(raw: unknown): string | null {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }

  return null;
}

function parseFiniteNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function mapServerPhase(raw: string | undefined): Phase | null {
  if (!raw) return null;
  const p = raw.toLowerCase().trim();
  if (p === "betting") return "preparing";
  if (p === "running") return "running";
  if (p === "busted" || p === "crashed" || p === "crash" || p === "lost")
    return "crashed";

  return null;
}

function parseBettingDeadlineMs(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  const ms = Date.parse(t);
  return Number.isFinite(ms) ? ms : null;
}

function authorityBetWindowFromPayload(round: Record<string, unknown> | null | undefined): AuthorityBetWindow | null {
  if (!round || typeof round !== "object") return null;
  const opens = parseBettingDeadlineMs(round.betting_opens_at);
  const closes = parseBettingDeadlineMs(round.betting_closes_at);
  if (opens !== null && closes !== null && closes > opens) {
    return { opensMs: opens, closesMs: closes };
  }
  if (closes !== null) return { opensMs: closes - 60_000, closesMs: closes };
  return null;
}

/** Server timestamp (ms) from a tick/poll payload — used to drop out-of-order updates. */
function authorityTsFromPayload(payload: {
  server_ts?: unknown;
  server_now?: unknown;
  emitted_at?: unknown;
}): number {
  const st = payload.server_ts;
  if (typeof st === "number" && Number.isFinite(st)) {
    // WS ticks carry microtime(true) — seconds with a fractional part.
    return st < 1e12 ? st * 1000 : st;
  }
  const iso = payload.server_now ?? payload.emitted_at;
  if (typeof iso === "string") {
    const ms = Date.parse(iso);
    if (Number.isFinite(ms)) return ms;
  }
  return 0;
}

export type IngestAuthoritativeOptions = {
  /**
   * Public HTTP poll snapshots use ISO `server_now` (often second-rounded). WS ticks use
   * `server_ts` from PHP microtime — sub-ms precision. A poll can legitimately parse to a
   * **smaller** ms value than the last WS tick even when the poll is newer, so the strict
   * monotonic check would drop every poll and freeze the UI (e.g. stuck on “Round starting”).
   */
  reconcilePoll?: boolean;
};

/** Apply authoritative multiplier/phase directly from realtime ticks when using real-money mode (and as a booster for demos). */
export function ingestAuthoritativeTick(
  payload: {
    id?: unknown;
    round_id?: unknown;
    phase?: unknown;
    multiplier?: unknown;
    betting_opens_at?: unknown;
    betting_closes_at?: unknown;
    growth_per_second?: unknown;
    server_ts?: unknown;
    server_now?: unknown;
    emitted_at?: unknown;
  },
  options?: IngestAuthoritativeOptions,
): void {
  const reconcilePoll = options?.reconcilePoll === true;
  const ts = authorityTsFromPayload(payload);

  // Drop stale payloads — a slow REST poll must not overwrite a fresher WS tick.
  // Skip this for `reconcilePoll`: poll is intentional reconciliation, not an out-of-order tick.
  if (!reconcilePoll && ts > 0) {
    if (ts < lastAuthorityTs) return;
    lastAuthorityTs = ts;
  }

  const srvPhase =
    typeof payload.phase === "string"
      ? mapServerPhase(payload.phase)
      : null;
  const roundId = parseRoundId(payload.round_id ?? payload.id);

  const mult =
    typeof payload.multiplier === "number" && Number.isFinite(payload.multiplier)
      ? payload.multiplier
      : null;

  // Capture the round's growth rate so the canvas can run the exponential curve
  // locally and interpolate smoothly between (relatively sparse) server ticks.
  if (
    typeof payload.growth_per_second === "number" &&
    Number.isFinite(payload.growth_per_second) &&
    payload.growth_per_second > 0
  ) {
    authGrowthPerSecond = payload.growth_per_second;
  }

  // Feed the interpolation buffer. Every running-phase tick shifts B -> A and
  // becomes the new B, so the live display can interpolate strictly *between*
  // two confirmed server values. `Math.max(mult, authVisualMult)` clamps a
  // late/stale REST poll up to the monotonic floor so it can never make the
  // visible multiplier bounce downward. A non-running tick clears the buffer;
  // the busted multiplier is applied authoritatively via reportFrame() instead.
  if (srvPhase === "running" && mult !== null) {
    const nowMs = Date.now();
    if (state.phase !== "running") {
      // New running round — reset the buffer and the monotonic floor.
      authSampleA = null;
      authSampleB = null;
      authVisualMult = mult;
    }
    const sampleMult = Math.max(mult, authVisualMult);
    if (authSampleB !== null && nowMs > authSampleB.atMs) {
      authSampleA = authSampleB;
    }
    authSampleB = { mult: sampleMult, atMs: nowMs };
  } else if (srvPhase !== null && srvPhase !== "running") {
    authSampleA = null;
    authSampleB = null;
    if (mult !== null) {
      authVisualMult = mult;
    }
  }

  const bwSource: Record<string, unknown> = {
    betting_opens_at: payload.betting_opens_at,
    betting_closes_at: payload.betting_closes_at,
  };
  const nextBetWin =
    srvPhase === "preparing"
      ? authorityBetWindowFromPayload(bwSource)
      : null;

  const betPatch: Partial<Pick<State, "authorityBetWindow" | "currentRound">> =
    srvPhase === "running" || srvPhase === "crashed"
      ? {
          authorityBetWindow: null,
          ...(roundId !== null ? { currentRound: { id: roundId, phase: srvPhase } } : {}),
        }
      : nextBetWin !== null
        ? {
            authorityBetWindow: nextBetWin,
            ...(roundId !== null && srvPhase !== null
              ? { currentRound: { id: roundId, phase: srvPhase } }
              : {}),
          }
        : roundId !== null && srvPhase !== null
          ? { currentRound: { id: roundId, phase: srvPhase } }
          : {};

  const applyBetPatch = (): void => {
    if (Object.keys(betPatch).length > 0) {
      setState(betPatch);
    }
  };

  const bumpPollReconcileClock = (): void => {
    if (reconcilePoll && ts > 0) {
      lastAuthorityTs = Math.max(lastAuthorityTs, ts);
    }
  };

  if (mult === null) {
    if (!srvPhase) {
      applyBetPatch();
      bumpPollReconcileClock();
      return;
    }
    if (srvPhase !== state.phase) {
      applyBetPatch();
      reportFrame(srvPhase, state.multiplier);
    } else {
      applyBetPatch();
    }
    bumpPollReconcileClock();
    return;
  }

  if (srvPhase === null || srvPhase === state.phase) {
    // While running, the RAF loop is the sole writer of `state.multiplier` — it
    // drives it from the buffered, behind-authority interpolation. Jamming the
    // raw (ahead-of-render) server value in here would re-introduce the forward
    // overshoot. The tick already updated the interpolation buffer above.
    if (srvPhase === "running" && state.phase === "running") {
      applyBetPatch();
      bumpPollReconcileClock();
      return;
    }
    setState({ multiplier: mult, ...betPatch });
    bumpPollReconcileClock();
    return;
  }

  applyBetPatch();
  reportFrame(srvPhase, mult);
  bumpPollReconcileClock();
}

/**
 * Smooth multiplier for the live (real-money) running phase.
 *
 * Renders ~{@link RENDER_BUFFER_MS} *behind* the freshest server tick and
 * interpolates between the two most recent confirmed samples (A → B). Because
 * the displayed value is bounded above by sample B — a value the server has
 * already reached — the multiplier can never overshoot the real crash point,
 * so it never snaps backwards when the bust tick lands, and a manual cash-out
 * at the displayed value is always still valid on the server.
 *
 * If a tick is dropped (render time runs past B) it extrapolates with the
 * round's growth rate, hard-capped at {@link MAX_EXTRAPOLATE_MS}. Returns the
 * plain store multiplier outside the `running` phase.
 */
export function liveAuthoritativeMultiplier(): number {
  if (state.phase !== "running" || authSampleB === null) {
    return state.multiplier;
  }

  const renderAt = Date.now() - RENDER_BUFFER_MS;
  let value: number;

  if (
    authSampleA !== null &&
    authSampleB.atMs > authSampleA.atMs &&
    renderAt <= authSampleB.atMs
  ) {
    // Interpolate strictly between two confirmed server samples — the common
    // path. Exponential blend matches the crash curve's shape.
    const span = authSampleB.atMs - authSampleA.atMs;
    const frac = Math.max(0, Math.min(1, (renderAt - authSampleA.atMs) / span));
    value =
      authSampleA.mult * Math.pow(authSampleB.mult / authSampleA.mult, frac);
  } else if (authGrowthPerSecond > 0) {
    // Render time has run past the freshest sample (dropped/delayed tick) or we
    // only have one sample so far — extrapolate from B, hard-capped.
    const dt =
      Math.min(MAX_EXTRAPOLATE_MS, Math.max(0, renderAt - authSampleB.atMs)) /
      1000;
    value = authSampleB.mult * Math.exp(authGrowthPerSecond * dt);
  } else {
    value = authSampleB.mult;
  }

  // Monotonic floor — the visible value never dips within a running round.
  authVisualMult = Math.max(authVisualMult, value);
  return authVisualMult;
}

/** Applies HTTP poll snapshot (public Laravel endpoint). No mode gate — caller only invokes for real-money feed. */
export function hydrateAuthoritativeFromServerState(payload: {
  multiplier_preview?: unknown;
  server_now?: unknown;
  round?: {
    id?: unknown;
    phase?: unknown;
    betting_opens_at?: unknown;
    betting_closes_at?: unknown;
    growth_per_second?: unknown;
  } | null;
}): void {
  const r = payload.round;
  if (r === null) {
    setState({ currentRound: null });
  }
  let phaseHint = "betting";
  if (r && typeof r === "object" && typeof r.phase === "string") {
    phaseHint = r.phase;
  }
  const preview = payload.multiplier_preview;
  const mult =
    typeof preview === "number" && Number.isFinite(preview) ? preview : 1;

  ingestAuthoritativeTick(
    {
      phase: phaseHint,
      id: r && typeof r === "object" ? r.id : undefined,
      multiplier: mult,
      server_now: payload.server_now,
      ...(r !== null && typeof r === "object"
        ? {
            betting_opens_at: r.betting_opens_at,
            betting_closes_at: r.betting_closes_at,
            growth_per_second: r.growth_per_second,
          }
        : {}),
    },
    { reconcilePoll: true },
  );
}

/** Called from the canvas animation loop on every frame. */
export function reportFrame(phase: Phase, multiplier: number): void {
  // Freshest value for the RAF-driven smooth display — no emit(), so this is
  // effectively free even when called at 60fps.
  frameMultiplier = multiplier;

  const prev = state.phase;
  const phaseChanged = phase !== prev;

  if (phaseChanged) {
    let pending = state.pending;
    let active = state.active;
    let lastResult = state.lastResult;

    if (phase === "running") {
      // Promote pending → active
      if (pending && !active) {
        roundCounter += 1;
        active = {
          ...pending,
          // Real-money bets carry the server crash_round_id; practice uses a local counter.
          roundId: pending.roundId ?? roundCounter,
          placedAt: performance.now(),
        };
        pending = null;
      }
    } else if (phase === "crashed" && active) {
      if (state.mode === "real") {
        // The server is authoritative for real money — a server-side auto-cashout may have
        // already paid this bet. Clear it locally and reconcile the true outcome against
        // /api/games/crash/my-bets instead of blindly synthesizing a loss.
        const settled = active;
        active = null;
        void reconcileRealRoundOutcome(settled, multiplier);
      } else {
        // Practice: local RNG is authoritative.
        resultCounter += 1;
        lastResult = {
          id: resultCounter,
          kind: "lose",
          bet: active.betUsd,
          multiplier,
          payout: 0,
        };
        active = null;
        playCrashSound("lose");
      }
    }

    state = {
      ...state,
      phase,
      multiplier,
      pending,
      active,
      lastResult,
    };
    emit();
    return;
  }

  // Auto cash-out check (practice only — real cash-outs are enforced server-side)
  if (
    state.mode === "practice" &&
    state.active &&
    phase === "running" &&
    multiplier >= state.active.autoTarget
  ) {
    resultCounter += 1;
    const a = state.active;
    const payout = +(a.betUsd * a.autoTarget).toFixed(2);
    state = {
      ...state,
      multiplier,
      active: null,
      practiceBalance: state.practiceBalance + payout,
      lastResult: {
        id: resultCounter,
        kind: "win",
        bet: a.betUsd,
        multiplier: a.autoTarget,
        payout,
      },
    };
    emit();
    playCrashSound("win");
    return;
  }

  // Throttle multiplier-only emissions for cheaper renders
  const now = performance.now();
  if (now - lastMultEmit > MULT_THROTTLE_MS) {
    lastMultEmit = now;
    state = { ...state, multiplier };
    emit();
  }
}

/** Queue a bet for the next round. Deducts from practice balance. */
export function queueBet(betUsd: number, autoTarget: number): boolean {
  if (state.mode === "real") return false;
  if (betUsd <= 0 || autoTarget < 1.01) return false;
  if (state.pending || state.active) return false;
  if (betUsd > state.practiceBalance) return false;

  setState({
    pending: { betUsd, autoTarget },
    practiceBalance: +(state.practiceBalance - betUsd).toFixed(2),
  });
  playCrashSound("bet");
  return true;
}

/**
 * Ledger-backed Crash bet placement (NEXT_PUBLIC_CRASH_REAL_MONEY).
 * Stakes are deducted server-side — do not mutate local wallets before success.
 */
export async function queueRealCrashBet(
  stakeMinor: number,
  autoTarget: number | null,
): Promise<{ ok: boolean; reason?: string }> {
  if (state.pending || state.active) {
    return { ok: false, reason: "busy" };
  }

  try {
    const idem =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `crash-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const body: Record<string, unknown> = {
      stake_minor: stakeMinor,
    };
    if (autoTarget !== null && autoTarget >= 1.01) {
      body.auto_cashout_multiplier = autoTarget;
    }

    const res = await fetch("/api/games/crash/bets", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(idem ? { "Idempotency-Key": idem } : {}),
      },
      body: JSON.stringify(body),
    });

    const payload: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        typeof payload === "object" &&
        payload &&
        typeof (payload as { message?: string }).message === "string"
          ? (payload as { message?: string }).message
          : "Bet failed.";
      return { ok: false, reason: msg };
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof (payload as { balance_after_minor?: unknown }).balance_after_minor !==
        "number"
    ) {
      return { ok: false, reason: "Invalid response." };
    }

    const bal = Math.floor((payload as { balance_after_minor: number }).balance_after_minor);
    const bet = (
      payload as {
        bet?: {
          stake_minor?: unknown;
          auto_cashout_multiplier?: unknown | null;
          crash_round_id?: unknown;
        };
      }
    ).bet;

    const parsedStakeMinor = parseFiniteNumber(bet?.stake_minor);
    const parsedAutoTarget = parseFiniteNumber(bet?.auto_cashout_multiplier);
    const resolvedStakeMinor =
      parsedStakeMinor !== null ? Math.floor(parsedStakeMinor) : stakeMinor;
    const stakeUsd = resolvedStakeMinor / 100;
    const auto =
      parsedAutoTarget !== null ? parsedAutoTarget : autoTarget ?? 1000;
    const roundId =
      typeof bet?.crash_round_id === "string" || typeof bet?.crash_round_id === "number"
        ? bet.crash_round_id
        : undefined;

    const acceptedBet: Pending = {
      betUsd: stakeUsd,
      autoTarget: auto,
      roundId,
      betMinor: resolvedStakeMinor,
    };

    // If the POST succeeds just after the authoritative feed flips to `running`,
    // there may be no future phase-change for `reportFrame()` to promote pending -> active.
    if (state.phase === "running" && roundId !== undefined && !state.active) {
      setState({
        realBalanceMinor: bal,
        pending: null,
        active: {
          ...acceptedBet,
          roundId,
          placedAt: performance.now(),
        },
      });
      playCrashSound("bet");
      return { ok: true };
    }

    // Otherwise stay in `pending` until the authoritative feed reports the round is `running`;
    // reportFrame promotes pending -> active.
    setState({
      realBalanceMinor: bal,
      pending: acceptedBet,
      active: null,
    });
    playCrashSound("bet");
    return { ok: true };
  } catch {
    return { ok: false, reason: "Network error." };
  }
}

/** Cancel a queued (not yet active) bet — refund. */
export async function cancelBet(): Promise<{ ok: boolean; reason?: string }> {
  if (!state.pending) return { ok: false, reason: "no-pending" };

  if (state.mode === "real") {
    try {
      const res = await fetch("/api/games/crash/bets/cancel", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const reason =
          typeof payload === "object" &&
          payload &&
          typeof (payload as { message?: string }).message === "string"
            ? (payload as { message: string }).message
            : "Cancel failed.";
        return { ok: false, reason };
      }

      const bal =
        typeof payload === "object" &&
        payload &&
        typeof (payload as { balance_after_minor?: unknown }).balance_after_minor ===
          "number"
          ? Math.floor((payload as { balance_after_minor: number }).balance_after_minor)
          : state.realBalanceMinor + (state.pending.betMinor ?? Math.round(state.pending.betUsd * 100));

      setState({
        pending: null,
        realBalanceMinor: bal,
      });
      playCrashSound("close");
      return { ok: true };
    } catch {
      return { ok: false, reason: "Network error." };
    }
  }

  const refund = state.pending.betUsd;
  setState({
    pending: null,
    practiceBalance: +(state.practiceBalance + refund).toFixed(2),
  });
  playCrashSound("close");
  return { ok: true };
}

type RealBetRow = Record<string, unknown>;

function openRealBetFromRow(row: RealBetRow): Pending | null {
  if (row.status !== "open") return null;

  const roundId = parseRoundId(row.crash_round_id);
  const rawStakeMinor = parseFiniteNumber(row.stake_minor);
  const stakeMinor =
    rawStakeMinor !== null ? Math.max(0, Math.floor(rawStakeMinor)) : null;

  if (roundId === null || stakeMinor === null || stakeMinor <= 0) {
    return null;
  }

  const rawAuto = parseFiniteNumber(row.auto_cashout_multiplier);
  const auto = rawAuto !== null && rawAuto >= 1.01 ? rawAuto : 1000;

  return {
    betUsd: stakeMinor / 100,
    autoTarget: auto,
    roundId,
    betMinor: stakeMinor,
  };
}

async function fetchRealBetRows(limit = 15): Promise<RealBetRow[] | null> {
  const res = await fetch(`/api/games/crash/my-bets?limit=${limit}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload: unknown = await res.json().catch(() => null);
  const bets =
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { bets?: unknown }).bets)
      ? (payload as { bets: RealBetRow[] }).bets
      : null;

  if (!res.ok || !bets) {
    return null;
  }

  return bets;
}

/**
 * Restore an open real-money bet after refresh/navigation. The DB keeps the bet,
 * but the client store is memory-only, so boot polling must rebuild pending/active.
 */
export async function restoreOpenRealBetFromServer(): Promise<void> {
  if (state.mode !== "real" || state.pending || state.active) return;

  const round = state.currentRound;
  if (round === null || round.phase === "crashed") return;

  try {
    const bets = await fetchRealBetRows(10);
    if (!bets) return;

    const restored = bets
      .map(openRealBetFromRow)
      .find((bet): bet is Pending => bet !== null && String(bet.roundId) === round.id);

    if (!restored || state.pending || state.active) return;

    if (round.phase === "running") {
      setState({
        pending: null,
        active: {
          ...restored,
          roundId: round.id,
          placedAt: performance.now(),
        },
      });
      return;
    }

    setState({
      pending: restored,
      active: null,
    });
  } catch {
    // Best-effort boot restore. Ongoing reconciliation still handles known active bets.
  }
}

function findRealBetRow(bets: RealBetRow[], bet: Active): RealBetRow | undefined {
  return bets.find(
    (b) => String(b.crash_round_id ?? "") === String(bet.roundId),
  );
}

function applySettledRealBetRow(
  bet: Active,
  row: RealBetRow,
  fallbackMultiplier: number,
): boolean {
  // Do not let an old async reconciliation mutate a newer active bet.
  if (state.active !== null && state.active.roundId !== bet.roundId) {
    return true;
  }

  const status = typeof row.status === "string" ? row.status : "";
  if (status === "open") {
    return false;
  }

  resultCounter += 1;

  if (status === "cashed_out") {
    const rawPayoutMinor = parseFiniteNumber(row.payout_minor);
    const rawCashoutMultiplier = parseFiniteNumber(row.cashout_multiplier);
    const payoutMinor =
      rawPayoutMinor !== null ? Math.max(0, Math.floor(rawPayoutMinor)) : 0;
    const mult =
      rawCashoutMultiplier !== null ? rawCashoutMultiplier : fallbackMultiplier;
    // Stake was already debited at placement; credit the server-confirmed payout.
    setState({
      active: null,
      cashoutInFlight: false,
      realBalanceMinor: state.realBalanceMinor + payoutMinor,
      lastResult: {
        id: resultCounter,
        kind: "win",
        bet: bet.betUsd,
        multiplier: mult,
        payout: +(payoutMinor / 100).toFixed(2),
      },
    });
    playCrashSound("win");
    return true;
  }

  if (status === "refunded") {
    const rawStakeMinor = parseFiniteNumber(row.stake_minor);
    const stakeMinor =
      rawStakeMinor !== null
        ? Math.max(0, Math.floor(rawStakeMinor))
        : bet.betMinor ?? Math.round(bet.betUsd * 100);
    setState({
      active: null,
      cashoutInFlight: false,
      realBalanceMinor: state.realBalanceMinor + stakeMinor,
      lastResult: {
        id: resultCounter,
        kind: "close",
        bet: bet.betUsd,
        multiplier: 1,
        payout: +(stakeMinor / 100).toFixed(2),
      },
    });
    playCrashSound("close");
    return true;
  }

  // "lost" or any terminal unknown status: stake stays debited.
  setState({
    active: null,
    cashoutInFlight: false,
    lastResult: {
      id: resultCounter,
      kind: "lose",
      bet: bet.betUsd,
      multiplier: fallbackMultiplier,
      payout: 0,
    },
  });
  playCrashSound("lose");
  return true;
}

/** Reconcile server-side auto cashout while a real-money round is still running. */
export async function reconcileActiveRealBet(): Promise<void> {
  const activeBet = state.mode === "real" ? state.active : null;
  if (!activeBet) return;

  try {
    const bets = await fetchRealBetRows(10);
    if (!bets) return;
    const row = findRealBetRow(bets, activeBet);
    if (!row) return;
    applySettledRealBetRow(activeBet, row, state.multiplier);
  } catch {
    // Polling reconciliation is best-effort; manual/bust reconciliation still exists.
  }
}

/** Reconcile a real-money bet's true outcome after its round busted. */
async function reconcileRealRoundOutcome(
  bet: Active,
  crashMultiplier: number,
): Promise<void> {
  try {
    const bets = await fetchRealBetRows(15);
    if (!bets) {
      finishRealRoundUnknown(bet, crashMultiplier);
      return;
    }

    const row = findRealBetRow(bets, bet);
    if (!row) {
      finishRealRoundUnknown(bet, crashMultiplier);
      return;
    }

    applySettledRealBetRow(bet, row, crashMultiplier);
  } catch {
    finishRealRoundUnknown(bet, crashMultiplier);
  }
}

/** Outcome couldn't be confirmed — show a neutral loss without touching the balance. */
function finishRealRoundUnknown(bet: Active, crashMultiplier: number): void {
  resultCounter += 1;
  setState({
    lastResult: {
      id: resultCounter,
      kind: "lose",
      bet: bet.betUsd,
      multiplier: crashMultiplier,
      payout: 0,
    },
  });
  playCrashSound("lose");
}

/** Manual cash-out at the current multiplier. */
export async function manualCashOut(): Promise<{ ok: boolean; reason?: string }> {
  if (state.mode === "real") {
    // Snapshot before any await — an interleaved authoritative tick can null `active`.
    const activeBet = state.active;
    if (!activeBet || state.phase !== "running") {
      return { ok: false, reason: "no-active" };
    }
    if (state.cashoutInFlight) {
      return { ok: false, reason: "busy" };
    }
    setState({ cashoutInFlight: true });
    try {
      const idem =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `cashout-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const res = await fetch("/api/games/crash/cashouts", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idem,
        },
        body: JSON.stringify({}),
      });
      const body: unknown = await res.json().catch(() => null);

      if (
        !res.ok ||
        typeof body !== "object" ||
        body === null ||
        (body as { ok?: unknown }).ok !== true
      ) {
        const reason =
          typeof body === "object" &&
          body &&
          typeof (body as { message?: string }).message === "string"
            ? (body as { message: string }).message
            : "Cash-out failed.";
        if (res.status === 404 || reason === "No active running round.") {
          setState({ active: null });
          requestCrashResync();
        }
        playCrashSound("close");
        return { ok: false, reason };
      }

      const co = (
        body as {
          cashout?: {
            cashout_multiplier?: number;
            payout_minor?: number;
            balance_after_minor?: number;
          };
        }
      ).cashout;

      if (
        typeof co?.cashout_multiplier !== "number" ||
        typeof co?.payout_minor !== "number" ||
        typeof co?.balance_after_minor !== "number"
      ) {
        playCrashSound("close");
        return { ok: false, reason: "Invalid cash-out response." };
      }

      resultCounter += 1;
      const mult = Number(co.cashout_multiplier);
      const payoutUsd = +(co.payout_minor / 100).toFixed(2);

      setState({
        active: null,
        realBalanceMinor: Math.floor(co.balance_after_minor),
        lastResult: {
          id: resultCounter,
          kind: "close",
          bet: activeBet.betUsd,
          multiplier: mult,
          payout: payoutUsd,
        },
      });
      playCrashSound("close");
      return { ok: true };
    } catch {
      playCrashSound("close");
      return { ok: false, reason: "Network error." };
    } finally {
      setState({ cashoutInFlight: false });
    }
  }

  if (!state.active || state.phase !== "running") {
    return { ok: false, reason: "no-active" };
  }
  const a = state.active;
  const mult = state.multiplier;
  if (mult < 1.01) return { ok: false, reason: "too-low" };
  const payout = +(a.betUsd * mult).toFixed(2);
  resultCounter += 1;
  setState({
    active: null,
    practiceBalance: +(state.practiceBalance + payout).toFixed(2),
    lastResult: {
      id: resultCounter,
      kind: "close",
      bet: a.betUsd,
      multiplier: mult,
      payout,
    },
  });
  playCrashSound("close");
  return { ok: true };
}

/** Hide the result overlay. */
export function acknowledgeResult(): void {
  if (!state.lastResult) return;
  setState({ lastResult: null });
}

/** Top-up the practice wallet (demo only). */
export function topUpPractice(amount: number): void {
  if (state.mode !== "practice") return;
  setState({ practiceBalance: +(state.practiceBalance + amount).toFixed(2) });
}
