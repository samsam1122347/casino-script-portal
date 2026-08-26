import { assets } from "../assets";
import { ROUTES } from "../paths";
import type { Game } from "../types";

/** Crash-only showcase tiles (all routes open the same Crash table for now). */
export const originalGames: Game[] = [
  {
    id: "crash",
    title: "Crash",
    provider: "CrashX",
    category: "originals",
    href: ROUTES.crash,
    image: assets.crash.icon,
    hot: true,
  },
  {
    id: "crash-classic",
    title: "Classic rounds",
    provider: "CrashX",
    category: "originals",
    href: ROUTES.crash,
    image: assets.games.crash,
  },
  {
    id: "crash-turbo",
    title: "Turbo speed",
    provider: "CrashX",
    category: "originals",
    href: ROUTES.crash,
    image: assets.crash.rocket,
    isNew: true,
  },
  {
    id: "crash-auto",
    title: "Auto cash-out",
    provider: "CrashX",
    category: "originals",
    href: ROUTES.crash,
    image: assets.crash.chart,
  },
  {
    id: "crash-provably",
    title: "Provably fair",
    provider: "CrashX",
    category: "originals",
    href: ROUTES.crash,
    image: assets.crash.howToPlay,
  },
  {
    id: "crash-live",
    title: "Live multiplier",
    provider: "CrashX",
    category: "originals",
    href: ROUTES.crash,
    image: assets.hero.originalGames,
  },
];

export const allGames: Game[] = [...originalGames];
