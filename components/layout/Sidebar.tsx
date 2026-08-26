"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowDownToLine, ArrowUpRight, ChevronDown, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  sidebarCrashCtaItem,
  sidebarInfo,
  sidebarMainNavForViewer,
} from "@/lib/nav";
import { BrandLockup } from "./BrandLockup";
import { CrashSidebarCta } from "./CrashSidebarCta";
import { SidebarLink } from "./SidebarLink";
import { LanguagePicker } from "./LanguagePicker";
import { LogoutForm } from "@/components/auth/LogoutForm";
import { ROUTES } from "@/lib/paths";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

export type SidebarUserPreview = {
  displayName: string;
  username: string | null;
  balanceMajor: number;
  avatarSrc: string;
};

export function Sidebar({
  authed,
  onNavigate,
  showHeader = true,
  /** True when rendered inside mobile sheet — avoids h-full clipping; outer shell scrolls. */
  embedded = false,
  userPreview,
}: {
  authed: boolean;
  onNavigate?: () => void;
  showHeader?: boolean;
  embedded?: boolean;
  userPreview?: SidebarUserPreview;
}) {
  const tTop = useTranslations("topbar");
  const tNav = useTranslations("nav");
  const [discoverOpen, setDiscoverOpen] = useState(false);

  const showUserCard = Boolean(embedded && authed && userPreview);
  const mainNavItems = sidebarMainNavForViewer(authed).filter((item) => {
    if (item.id === "crash") return false;
    // Wallet actions live in their own quick-row when embedded for an authed user.
    if (showUserCard && (item.id === "deposit" || item.id === "withdraw")) {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "relative flex flex-col gap-3 bg-gradient-to-b from-[var(--color-bg-deep)] via-[#070b1d] to-[var(--color-panel)] p-3 shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,transparent_24%,transparent_100%),radial-gradient(ellipse_90%_80%_at_0%_8%,rgba(35,243,111,0.09),transparent_56%),radial-gradient(ellipse_90%_70%_at_100%_100%,rgba(138,85,255,0.08),transparent_58%)] before:opacity-95",
        embedded
          ? "min-h-min w-full overflow-x-clip pt-0 pb-1"
          : "h-full min-h-0 flex flex-col overflow-hidden border-r border-[var(--chrome-border)]",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          embedded
            ? ""
            : "sidebar-nav-scroll no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain",
        )}
      >
      {showHeader ? (
        <div className="relative z-[1] flex flex-col gap-1.5">
          <BrandLockup size="md" onClick={onNavigate} priority={embedded} />
          {!showUserCard ? (
            <hr className="chrome-rule mx-1 mt-1" aria-hidden />
          ) : null}
        </div>
      ) : null}

      {showUserCard && userPreview ? (
        <div className="relative z-[1] overflow-hidden rounded-2xl border border-white/[0.07] bg-[linear-gradient(180deg,rgba(35,243,111,0.07)_0%,rgba(138,85,255,0.06)_100%),rgba(13,18,48,0.78)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_-30px_rgba(0,0,0,0.9)]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-brand)]/55 to-transparent"
          />
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <span
                aria-hidden
                className="absolute inset-0 -m-0.5 rounded-full bg-[conic-gradient(from_90deg,var(--color-brand),#925cff,#5eeedc,var(--color-brand))] opacity-80 blur-[2px]"
              />
              <span className="relative grid size-11 place-items-center overflow-hidden rounded-full bg-[var(--color-bg-elevated)] ring-2 ring-black/40">
                <Image
                  src={userPreview.avatarSrc}
                  alt=""
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-brand)]/85">
                {tTop("welcomeBack")}
              </p>
              <p className="truncate font-display text-base font-extrabold leading-tight tracking-[-0.025em] text-white">
                {userPreview.displayName}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-black/35 px-3 py-2 ring-1 ring-white/[0.05]">
            <Wallet className="h-4 w-4 shrink-0 text-[var(--color-brand)]/85" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                {tTop("balanceLabel")}
              </p>
              <p className="numeric truncate text-base font-extrabold leading-tight text-white tabular-nums">
                {formatMoney(userPreview.balanceMajor)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {showUserCard ? (
        <div className="relative z-[1] grid grid-cols-2 gap-2">
          <Link
            href={ROUTES.deposit}
            onClick={onNavigate}
            className="group relative flex min-h-12 items-center gap-2.5 overflow-hidden rounded-xl border border-[var(--color-brand)]/22 bg-[linear-gradient(150deg,rgba(35,243,111,0.16)_0%,rgba(13,18,48,0.78)_100%)] px-3 transition-[transform,border-color,box-shadow] hover:border-[var(--color-brand)]/45 active:translate-y-px"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--color-brand)]/18 text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30">
              <ArrowDownToLine className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 truncate text-[13px] font-extrabold text-white">
              {tNav("deposit")}
            </span>
          </Link>
          <Link
            href={ROUTES.withdraw}
            onClick={onNavigate}
            className="group relative flex min-h-12 items-center gap-2.5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 transition-[transform,border-color,background-color] hover:border-white/15 hover:bg-white/[0.07] active:translate-y-px"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-[var(--color-accent-ice)] ring-1 ring-white/[0.08]">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 truncate text-[13px] font-extrabold text-white/90">
              {tNav("withdraw")}
            </span>
          </Link>
        </div>
      ) : null}

      <p className="px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
        {showUserCard ? "Navigate" : "Account"}
      </p>
      <nav
        aria-label="Main"
        className="relative z-[1] dashboard-card-compact grid gap-1 p-2"
      >
        <CrashSidebarCta item={sidebarCrashCtaItem} onNavigate={onNavigate} />
        {mainNavItems.map((item) => (
          <SidebarLink
            key={item.id}
            item={item}
            variant="side"
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="hidden lg:block">
        <p className="px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
          Discover
        </p>
        <nav
          aria-label="Information"
          className="relative z-[1] dashboard-card-compact grid gap-1 p-2"
        >
          {sidebarInfo.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              variant="side"
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>

      <details
        className="group/discover relative z-[1] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025] lg:hidden"
        open={discoverOpen}
        onToggle={(e) =>
          setDiscoverOpen((e.currentTarget as HTMLDetailsElement).open)
        }
      >
        <summary className="flex min-h-11 cursor-pointer select-none list-none touch-manipulation items-center justify-between rounded-xl px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white [&::-webkit-details-marker]:hidden">
          <span>Discover</span>
          <ChevronDown
            className="h-4 w-4 text-white/45 transition-transform duration-200 group-open/discover:rotate-180 group-open/discover:text-[var(--color-brand)]"
            aria-hidden
          />
        </summary>
        <nav
          aria-label="Information"
          className="grid gap-1 border-t border-white/[0.05] p-2"
        >
          {sidebarInfo.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              variant="side"
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </details>
      </div>

      <div
        className={cn(
          "relative z-[1] shrink-0 space-y-2 border-t border-white/[0.07] pt-3",
          embedded && "grid gap-2",
        )}
      >
        <LanguagePicker align={embedded ? "start" : "end"} />
        {embedded && authed ? <LogoutForm variant="labeled" /> : null}
      </div>
    </aside>
  );
}
