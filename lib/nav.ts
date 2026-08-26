import { ROUTES } from "./paths";
import type { NavItem } from "./types";

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const href = item.href;
  if (href === "/") return pathname === "/";
  if (href.startsWith("#")) return false;
  if (pathname === href) return true;
  if (item.activeMatch === "exact") return false;
  return pathname.startsWith(`${href}/`);
}

export const topNav: NavItem[] = [
  {
    id: "home",
    messageKey: "home",
    href: ROUTES.home,
    icon: "home",
    routeKey: "home",
  },
  {
    id: "crash",
    messageKey: "crash",
    href: ROUTES.crash,
    icon: "rocket",
    routeKey: "crash",
  },
  {
    id: "profile",
    messageKey: "profile",
    href: ROUTES.profile,
    icon: "user",
    routeKey: "profile",
    activeMatch: "exact",
  },
  {
    id: "bonuses",
    messageKey: "bonuses",
    href: ROUTES.bonuses,
    icon: "gift",
    routeKey: "bonuses",
  },
  {
    id: "vip",
    messageKey: "vip",
    href: ROUTES.vip,
    icon: "vip",
    routeKey: "vip",
  },
];

export const sidebarCrashCtaItem: NavItem = {
  id: "crash",
  messageKey: "playCrash",
  href: ROUTES.crash,
  icon: "rocket",
  routeKey: "crash",
};

export const sidebarMain: NavItem[] = [
  sidebarCrashCtaItem,
  {
    id: "home",
    messageKey: "home",
    href: ROUTES.home,
    icon: "home",
    routeKey: "home",
  },
  {
    id: "profile",
    messageKey: "profile",
    href: ROUTES.profile,
    icon: "user",
    routeKey: "profile",
    activeMatch: "exact",
  },
  { id: "support", messageKey: "support", href: "#support", icon: "support" },
  {
    id: "deposit",
    messageKey: "deposit",
    href: ROUTES.deposit,
    icon: "deposit",
    routeKey: "deposit",
  },
  {
    id: "withdraw",
    messageKey: "withdraw",
    href: ROUTES.withdraw,
    icon: "withdraw",
    routeKey: "withdraw",
  },
  {
    id: "vip",
    messageKey: "vip",
    href: ROUTES.vip,
    icon: "vip",
    routeKey: "vip",
  },
];

export const sidebarInfo: NavItem[] = [
  {
    id: "about",
    messageKey: "about",
    href: ROUTES.about,
    icon: "info",
    routeKey: "about",
  },
  {
    id: "promotions",
    messageKey: "promotions",
    href: ROUTES.promotions,
    icon: "promo",
    routeKey: "promotions",
  },
  {
    id: "sponsorships",
    messageKey: "sponsorships",
    href: ROUTES.sponsorships,
    icon: "sponsorship",
    routeKey: "sponsorships",
  },
  {
    id: "licenses",
    messageKey: "licenses",
    href: ROUTES.licenses,
    icon: "license",
    routeKey: "licenses",
  },
  {
    id: "feedback",
    messageKey: "feedback",
    href: ROUTES.feedback,
    icon: "feedback",
    routeKey: "feedback",
  },
  {
    id: "news",
    messageKey: "news",
    href: ROUTES.news,
    icon: "news",
    routeKey: "news",
  },
];

export const profileNav: NavItem[] = [
  {
    id: "profile",
    messageKey: "profile",
    href: ROUTES.profile,
    icon: "user",
    routeKey: "profile",
    activeMatch: "exact",
  },
  {
    id: "deposit",
    messageKey: "deposit",
    href: ROUTES.deposit,
    icon: "deposit",
    routeKey: "deposit",
  },
  {
    id: "withdraw",
    messageKey: "withdraw",
    href: ROUTES.withdraw,
    icon: "withdraw",
    routeKey: "withdraw",
  },
  {
    id: "bonuses",
    messageKey: "bonuses",
    href: ROUTES.bonuses,
    icon: "gift",
    routeKey: "bonuses",
  },
  {
    id: "settings",
    messageKey: "settings",
    href: ROUTES.settings,
    icon: "settings",
    routeKey: "settings",
  },
  {
    id: "transactions",
    messageKey: "transactions",
    href: ROUTES.transactions,
    icon: "transactions",
    routeKey: "transactions",
  },
];

export const bottomNav: NavItem[] = [
  {
    id: "home",
    messageKey: "home",
    href: ROUTES.home,
    icon: "home",
    routeKey: "home",
  },
  {
    id: "crash",
    messageKey: "crash",
    href: ROUTES.crash,
    icon: "rocket",
    routeKey: "crash",
  },
  {
    id: "wallet",
    messageKey: "wallet",
    href: ROUTES.deposit,
    icon: "wallet",
    routeKey: "deposit",
  },
  {
    id: "profile",
    messageKey: "profile",
    href: ROUTES.profile,
    icon: "user",
    routeKey: "profile",
    activeMatch: "exact",
  },
];

export type FooterColumn = {
  id: "main" | "team" | "info" | "profile";
  links: { id: string; href: string }[];
};

export const footerColumns: FooterColumn[] = [
  {
    id: "main",
    links: [
      { id: "crash", href: ROUTES.crash },
      { id: "promotions", href: ROUTES.promotions },
      { id: "vipClub", href: ROUTES.vip },
    ],
  },
  {
    id: "team",
    links: [
      { id: "aboutUs", href: ROUTES.about },
      { id: "sponsorships", href: ROUTES.sponsorships },
      { id: "feedback", href: ROUTES.feedback },
      { id: "liveSupport", href: "#support" },
    ],
  },
  {
    id: "info",
    links: [
      { id: "privacySecurity", href: ROUTES.licenses },
      { id: "termsFairPlay", href: ROUTES.responsibleGaming },
      { id: "licensesSecurity", href: ROUTES.licenses },
      { id: "responsibleGaming", href: ROUTES.responsibleGaming },
    ],
  },
  {
    id: "profile",
    links: [
      { id: "deposit", href: ROUTES.deposit },
      { id: "withdraw", href: ROUTES.withdraw },
      { id: "bonuses", href: ROUTES.bonuses },
      { id: "settings", href: ROUTES.settings },
    ],
  },
];

const ACCOUNT_LOCKED_SIDEBAR_IDS = new Set(["profile", "deposit", "withdraw"]);

const guestAuthSidebarLinks: NavItem[] = [
  {
    id: "login",
    messageKey: "loginNav",
    href: ROUTES.login,
    icon: "logIn",
    routeKey: "login",
  },
  {
    id: "signup",
    messageKey: "signupNav",
    href: ROUTES.signup,
    icon: "signUp",
    routeKey: "signup",
  },
];

/** Sidebar Account section: signed-out users see Log in / Sign up instead of profile & wallet links. */
export function sidebarMainNavForViewer(authed: boolean): NavItem[] {
  const core = sidebarMain.filter((item) => item.id !== "crash");
  if (authed) return core;
  const preserved = core.filter((item) => !ACCOUNT_LOCKED_SIDEBAR_IDS.has(item.id));
  const homeIdx = preserved.findIndex((item) => item.id === "home");
  const insertAt = homeIdx >= 0 ? homeIdx + 1 : 0;
  return [
    ...preserved.slice(0, insertAt),
    ...guestAuthSidebarLinks,
    ...preserved.slice(insertAt),
  ];
}

const TOP_NAV_NEED_AUTH = new Set(["profile", "bonuses"]);

/** Desktop top strip: hide profile & bonuses until authenticated (those routes require login). */
export function topNavForViewer(authed: boolean): NavItem[] {
  if (authed) return topNav;
  return topNav.filter((item) => !TOP_NAV_NEED_AUTH.has(item.id));
}

/** Mobile tab bar fourth slot: wallet vs register when signed out. */
export function bottomNavForViewer(authed: boolean): NavItem[] {
  if (authed) return bottomNav;
  return [
    bottomNav[0],
    bottomNav[1],
    guestAuthSidebarLinks[0],
    guestAuthSidebarLinks[1],
  ];
}

/** Footer “profile” column lists login/register for guests. */
export function footerColumnsForViewer(authed: boolean): FooterColumn[] {
  if (authed) return footerColumns;
  return footerColumns.map((col) =>
    col.id === "profile"
      ? {
          id: "profile",
          links: [
            { id: "loginGuest", href: ROUTES.login },
            { id: "signupGuest", href: ROUTES.signup },
          ],
        }
      : col,
  );
}
