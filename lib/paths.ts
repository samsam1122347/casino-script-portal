import type { RouteKey } from "./types";
import { SITE } from "./site";

export { SITE };

export const ROUTES: Record<RouteKey, string> = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  crash: "/games/crash",
  profile: "/profile",
  deposit: "/profile/deposit",
  withdraw: "/profile/withdraw",
  bonuses: "/profile/bonuses",
  settings: "/profile/settings",
  transactions: "/profile/transactions",
  about: "/about",
  promotions: "/promotions",
  vip: "/vip",
  sponsorships: "/sponsorships",
  licenses: "/licenses",
  feedback: "/feedback",
  news: "/news",
  responsibleGaming: "/responsible-gaming",
};

export const NEWS_BASE = ROUTES.news;
export const newsHref = (slug: string) => `${NEWS_BASE}/${slug}`;
