import type { VipPerk } from "../types";

export const vipPerks: VipPerk[] = [
  {
    id: "general",
    title: "VIP on Crash",
    description:
      "Higher Crash limits, priority withdrawals, and profile flair as you level up.",
    icon: "vip",
  },
  {
    id: "vip-cashback",
    title: "Boosted VIP cashback",
    description:
      "Up to 25% cashback on Crash volume, paid daily with no wagering requirements.",
    icon: "spark",
  },
  {
    id: "higher",
    title: "Higher limits",
    description:
      "Raise your weekly deposit and withdrawal caps so you can size Crash bets your way.",
    icon: "wallet",
  },
  {
    id: "max-bet",
    title: "Higher max bet",
    description:
      "Unlock larger single Crash stakes and auto cash-out ceilings at the top tiers.",
    icon: "rocket",
  },
  {
    id: "manager",
    title: "Personal manager",
    description:
      "Direct line to a VIP host for limits, Crash promos, and account questions.",
    icon: "support",
  },
  {
    id: "bonuses",
    title: "VIP bonuses",
    description:
      "Level-up rewards and surprise drops tuned for active Crash players.",
    icon: "gift",
  },
];
