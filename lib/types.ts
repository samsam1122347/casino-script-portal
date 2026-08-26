export type RouteKey =
  | "home"
  | "login"
  | "signup"
  | "forgotPassword"
  | "crash"
  | "profile"
  | "deposit"
  | "withdraw"
  | "bonuses"
  | "settings"
  | "transactions"
  | "about"
  | "promotions"
  | "vip"
  | "sponsorships"
  | "licenses"
  | "feedback"
  | "news"
  | "responsibleGaming";

export type IconName =
  | "home"
  | "user"
  | "gift"
  | "crown"
  | "support"
  | "deposit"
  | "withdraw"
  | "info"
  | "promo"
  | "sponsorship"
  | "license"
  | "feedback"
  | "news"
  | "vip"
  | "settings"
  | "transactions"
  | "verified"
  | "spark"
  | "flame"
  | "bell"
  | "language"
  | "menu"
  | "close"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "logIn"
  | "signUp"
  | "copy"
  | "check"
  | "plus"
  | "minus"
  | "wallet"
  | "play"
  | "rocket"
  | "dice"
  | "search"
  | "shield";

export type Game = {
  id: string;
  title: string;
  /** Shown as small caps line under title (e.g. series / studio). */
  provider: string;
  category: "originals" | "live" | "mirror";
  href: string;
  image: string;
  hot?: boolean;
  isNew?: boolean;
};

export type Promo = {
  id: string;
  slug: string;
  image: string;
  badge?: string;
  endsAt?: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  image: string;
  publishedAt: string;
};

export type Review = {
  id: string;
  username: string;
  avatar: string;
  rating: 1 | 2 | 3 | 4 | 5;
  joinedYear: number;
};

export type Partner = {
  id: string;
  name: string;
  logo: string;
  background: string;
};

export type CryptoCurrency = {
  id: string;
  symbol: string;
  name: string;
  network: string;
  icon: string;
  minDeposit: number;
  /** Extra chains supported by this asset (e.g. USDT); deposit UI lists these—treasury rail stays `network`. */
  supportedNetworks?: readonly string[];
};

export type NavItem = {
  id: string;
  /** Key under the `nav` messages namespace (e.g. `home` → `nav.home`). */
  messageKey: string;
  href: string;
  icon: IconName;
  routeKey?: RouteKey;
  external?: boolean;
  /** `"exact"` = only `pathname === href` (use for `/profile` so `/profile/deposit` isn’t a parent match). Default: prefix. */
  activeMatch?: "exact" | "prefix";
};

export type VipPerk = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
};

export type Locale = {
  code: string;
  label: string;
  flag: string;
};
