"use client";

import { useEffect, useState } from "react";
import { env } from "@/lib/env";

/** Tenant stake/win limits surfaced by `/api/site/crash-state`. Values may be
 *  null when the tenant has not been configured. */
export type CrashLimits = {
  min_bet_minor: number | null;
  max_bet_minor: number | null;
  max_win_minor_per_round: number | null;
  max_multiplier_cap: number | null;
};

/** Provably-fair fields from the public crash-state `round` object. */
export type CrashRoundInfo = {
  phase: string | null;
  hash_commitment: string | null;
  pf_nonce: string | null;
  external_round_id: string | null;
  /** Only present once the round has busted. */
  crash_point_multiplier: number | null;
  /** Appears in the busted broadcast / state once the seed is revealed. */
  revealed_server_seed: string | null;
};

export type CrashPublicState = {
  limits: CrashLimits | null;
  round: CrashRoundInfo | null;
};

function asNumberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function parseLimits(raw: unknown): CrashLimits | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  return {
    min_bet_minor: asNumberOrNull(o.min_bet_minor),
    max_bet_minor: asNumberOrNull(o.max_bet_minor),
    max_win_minor_per_round: asNumberOrNull(o.max_win_minor_per_round),
    max_multiplier_cap: asNumberOrNull(o.max_multiplier_cap),
  };
}

function parseRound(raw: unknown): CrashRoundInfo | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  return {
    phase: asStringOrNull(o.phase),
    hash_commitment: asStringOrNull(o.hash_commitment),
    pf_nonce:
      asStringOrNull(o.pf_nonce) ??
      (typeof o.pf_nonce === "number" ? String(o.pf_nonce) : null),
    external_round_id:
      asStringOrNull(o.external_round_id) ??
      (typeof o.external_round_id === "number"
        ? String(o.external_round_id)
        : null),
    crash_point_multiplier: asNumberOrNull(o.crash_point_multiplier),
    revealed_server_seed: asStringOrNull(o.revealed_server_seed),
  };
}

/**
 * Lightweight, self-contained poll of the public `/api/site/crash-state`
 * endpoint for the limits + provably-fair round fields. This is intentionally
 * separate from CrashLiveSection's authoritative WS/poll loop — it adds a slow
 * (4s) reconciliation poll and never mutates the crash store.
 *
 * `enabled` gates polling so practice-only / signed-out pages stay quiet.
 */
export function useCrashPublicState(enabled: boolean): CrashPublicState {
  const [state, setState] = useState<CrashPublicState>({
    limits: null,
    round: null,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: number | undefined;

    async function poll(): Promise<void> {
      try {
        const qs = encodeURIComponent(env.NEXT_PUBLIC_TENANT_SLUG);
        const res = await fetch(`/api/site/crash-state?tenant=${qs}`, {
          cache: "no-store",
          credentials: "omit",
        });
        const payload: unknown = await res.json().catch(() => null);
        if (cancelled || !res.ok || typeof payload !== "object" || payload === null) {
          return;
        }
        const p = payload as { limits?: unknown; round?: unknown };
        const next: CrashPublicState = {
          limits: parseLimits(p.limits),
          round: parseRound(p.round),
        };
        setState((prev) => {
          // Avoid re-render churn when nothing meaningful changed.
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
      } catch {
        // Network hiccup — keep the last known values.
      }
    }

    function schedule(): void {
      if (cancelled) return;
      timer = window.setTimeout(tick, 4000);
    }

    async function tick(): Promise<void> {
      if (!cancelled && !document.hidden) {
        await poll();
      }
      schedule();
    }

    void poll().then(schedule);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [enabled]);

  return state;
}
