export type LiveBet = {
  id: string;
  username: string;
  /** 0..7 — picks a deterministic gradient. */
  hue: number;
  betUsd: number;
  /** undefined when bust (no cash-out). */
  multiplier?: number;
  payoutUsd: number;
  status: "won" | "lost";
  emittedAt: number;
};

export type TopMultiplier = {
  id: string;
  username: string;
  multiplier: number;
  payoutUsd: number;
};

const HUE_COUNT = 8;

const NAME_ROOTS: Record<string, readonly string[]> = {
  en: [
    "Atlas", "Nova", "Echo", "Riley", "Casey", "Jordan", "Logan", "Quinn",
    "River", "Sage", "Drew", "Sky", "Reese", "Avery", "Blake", "Cory",
    "Dante", "Eden", "Fox", "Gage", "Hayes", "Iris", "Jett", "Kai",
    "Lex", "Milo", "Nico", "Onyx", "Pax", "Reed", "Storm", "Tate",
  ],
  es: [
    "Lobo", "Aitor", "Bruno", "Mateo", "Diego", "Iker", "Pablo", "Hugo",
    "Leo", "Rafa", "Suri", "Nico", "Saul", "Aleix", "Adan", "Sergi",
  ],
  pt: [
    "Bruno", "Joao", "Diogo", "Tiago", "Vasco", "Rafa", "Pedro", "Igor",
    "Murilo", "Caio", "Lucio", "Davi", "Erick", "Lara",
  ],
  de: [
    "Jonas", "Lukas", "Finn", "Noah", "Leon", "Tim", "Ben", "Felix",
    "Paul", "Henrik", "Mats", "Linus", "Theo", "Emil",
  ],
  fr: [
    "Lucas", "Hugo", "Adrien", "Theo", "Mael", "Nathan", "Tom", "Enzo",
    "Tristan", "Remy", "Yanis", "Soren", "Lou", "Anton",
  ],
  tr: [
    "Emir", "Yusuf", "Mert", "Berk", "Kerem", "Eren", "Onur", "Baran",
    "Tuna", "Kaan", "Ege", "Alp", "Tan", "Cem",
  ],
  ru: [
    "Mikha", "Roma", "Sasha", "Pasha", "Ilya", "Vlad", "Kostya", "Dima",
    "Egor", "Nikit", "Stas", "Yura", "Slava", "Lev",
  ],
  ja: [
    "Haru", "Ren", "Sora", "Kai", "Yuto", "Sho", "Riku", "Aoi",
    "Tsuki", "Hiro", "Daiki", "Kaito", "Aki", "Tora",
  ],
};

const NAME_SUFFIXES = ["", "X", "_99", "77", "_pro", "GG", "TV", "OG", "ZR", "_alpha"];

function pickRoots(locale: string): readonly string[] {
  return NAME_ROOTS[locale] ?? NAME_ROOTS.en;
}

function pickHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % HUE_COUNT;
}

function rand(): number {
  return Math.random();
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((min + rand() * (max - min)) * factor) / factor;
}

function makeName(locale: string): string {
  const roots = pickRoots(locale);
  const base = roots[randInt(0, roots.length - 1)] ?? "Player";
  const choice = rand();
  if (choice < 0.5) {
    return `${base}${NAME_SUFFIXES[randInt(0, NAME_SUFFIXES.length - 1)] ?? ""}`.slice(0, 12);
  }
  if (choice < 0.85) {
    return `${base}${randInt(1, 99)}`.slice(0, 12);
  }
  return `${base}${base.charAt(0)}${randInt(10, 999)}`.slice(0, 12);
}

function makeId(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars.charAt(randInt(0, chars.length - 1));
  }
  return out;
}

export function createLiveBet(locale: string = "en"): LiveBet {
  const username = makeName(locale);
  const bet = randFloat(1, 150);

  // ~38 % bust rate — enough red to feel honest, mostly wins for marketing
  const bust = rand() < 0.38;

  if (bust) {
    return {
      id: makeId(10),
      username,
      hue: pickHue(username),
      betUsd: bet,
      payoutUsd: 0,
      status: "lost",
      emittedAt: Date.now(),
    };
  }

  const roll = rand();
  const mult =
    roll < 0.04
      ? randFloat(10, 50)
      : roll < 0.18
        ? randFloat(3, 10)
        : randFloat(1.01, 3.5);

  return {
    id: makeId(10),
    username,
    hue: pickHue(username),
    betUsd: bet,
    multiplier: mult,
    payoutUsd: Math.round(bet * mult * 100) / 100,
    status: "won",
    emittedAt: Date.now(),
  };
}

export function seedLiveBets(count: number, locale: string = "en"): LiveBet[] {
  return Array.from({ length: count }, () => createLiveBet(locale));
}

export function createTopMultipliers(
  count: number,
  locale: string = "en",
): TopMultiplier[] {
  return Array.from({ length: count }, () => {
    const username = makeName(locale);
    const multiplier = randFloat(5, 50);
    const stake = randFloat(2, 50);
    return {
      id: makeId(8),
      username,
      multiplier,
      payoutUsd: Math.round(stake * multiplier * 100) / 100,
    };
  }).sort((a, b) => b.multiplier - a.multiplier);
}
