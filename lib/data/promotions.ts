import { assets } from "../assets";
import type { Promo } from "../types";

export const promotions: Promo[] = [
  {
    id: "vip-cashback",
    slug: "vip-cashback",
    image: assets.promotions.rakeback,
    badge: "Daily",
  },
  {
    id: "race",
    slug: "race",
    image: assets.promotions.race,
    badge: "Weekly",
    endsAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "battle-x",
    slug: "battle-x",
    image: assets.promotions.battleX,
  },
  {
    id: "raffle",
    slug: "raffle",
    image: assets.promotions.raffle,
    badge: "Weekly",
    endsAt: "2026-05-31T00:00:00Z",
  },
  {
    id: "bonuses",
    slug: "bonuses",
    image: assets.promotions.bonuses,
  },
  {
    id: "pragmatic",
    slug: "pragmatic",
    image: assets.promotions.pragmatic,
  },
  {
    id: "werder",
    slug: "werder-bremen",
    image: assets.promotions.werder,
    badge: "Partner",
  },
  {
    id: "multiplier-monday",
    slug: "multiplier-monday",
    image: assets.promotions.sevensix,
  },
];
