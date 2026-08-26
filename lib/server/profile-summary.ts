import { serverLaravelFetch } from "@/lib/server/laravel";

export type ProfileTotals = {
  deposits_minor: number;
  withdrawals_minor: number;
  bonuses_minor: number;
};

/** Mirrors `GET /api/v1/profile/summary` `vip` object. */
export type ProfileVip = {
  tier_id: string;
  tier_label_key: string;
  tier_index: number;
  xp_total: number;
  xp_floor_current_tier: number;
  xp_ceiling_next_tier: number | null;
  progress_percent: number;
  xp_to_next: number;
  next_tier_bonus_minor: number;
  at_max: boolean;
};

export type ProfileSummaryData = {
  totals: ProfileTotals;
  vip: ProfileVip;
};

/** Client-side fallback when the API is unreachable (matches empty-wallet / zero-deposit rules). */
export const FALLBACK_PROFILE_VIP: ProfileVip = {
  tier_id: "bronze_1",
  tier_label_key: "bronze_1",
  tier_index: 0,
  xp_total: 0,
  xp_floor_current_tier: 0,
  xp_ceiling_next_tier: 600,
  progress_percent: 0,
  xp_to_next: 600,
  next_tier_bonus_minor: 5_000,
  at_max: false,
};

function parseVip(raw: unknown): ProfileVip | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const v = raw as Record<string, unknown>;
  const tierId = typeof v.tier_id === "string" ? v.tier_id : null;
  const labelKey =
    typeof v.tier_label_key === "string" ? v.tier_label_key : tierId;
  if (!tierId || !labelKey) {
    return null;
  }

  return {
    tier_id: tierId,
    tier_label_key: labelKey,
    tier_index: typeof v.tier_index === "number" ? v.tier_index : 0,
    xp_total: typeof v.xp_total === "number" ? v.xp_total : 0,
    xp_floor_current_tier:
      typeof v.xp_floor_current_tier === "number"
        ? v.xp_floor_current_tier
        : 0,
    xp_ceiling_next_tier:
      typeof v.xp_ceiling_next_tier === "number"
        ? v.xp_ceiling_next_tier
        : null,
    progress_percent:
      typeof v.progress_percent === "number" ? v.progress_percent : 0,
    xp_to_next: typeof v.xp_to_next === "number" ? v.xp_to_next : 0,
    next_tier_bonus_minor:
      typeof v.next_tier_bonus_minor === "number"
        ? v.next_tier_bonus_minor
        : 0,
    at_max: Boolean(v.at_max),
  };
}

export async function getProfileSummary(): Promise<ProfileSummaryData | null> {
  try {
    const res = await serverLaravelFetch("/api/v1/profile/summary");
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as {
      totals?: {
        deposits_minor?: number;
        withdrawals_minor?: number;
        bonuses_minor?: number;
      };
      vip?: unknown;
    };

    const t = data.totals;
    if (!t || typeof t !== "object") {
      return null;
    }

    const vip =
      parseVip(data.vip) ??
      ({
        ...FALLBACK_PROFILE_VIP,
      } satisfies ProfileVip);

    return {
      totals: {
        deposits_minor:
          typeof t.deposits_minor === "number" ? t.deposits_minor : 0,
        withdrawals_minor:
          typeof t.withdrawals_minor === "number" ? t.withdrawals_minor : 0,
        bonuses_minor:
          typeof t.bonuses_minor === "number" ? t.bonuses_minor : 0,
      },
      vip,
    };
  } catch {
    return null;
  }
}
