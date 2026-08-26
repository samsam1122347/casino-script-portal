import { assets } from "../assets";
import type { NewsItem } from "../types";

/** Structural data only — copy lives in `newsArticles` messages. */
export const newsItems: NewsItem[] = [
  {
    id: "trust-wallet-deposit",
    slug: "trust-wallet-deposit",
    image: assets.news.deposit,
    publishedAt: "2026-04-21T10:00:00Z",
  },
  {
    id: "bank-card-deposit",
    slug: "bank-card-deposit",
    image: assets.news.bankCard,
    publishedAt: "2026-04-19T08:00:00Z",
  },
];
