"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LandingGridVideo } from "@/components/blocks/LandingGridVideo";
import type { NavItem } from "@/lib/types";
import { isNavItemActive } from "@/lib/nav";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";

export function CrashSidebarCta({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const t = useTranslations("nav");
  const tHome = useTranslations("home");
  const active = isNavItemActive(item, pathname);
  const label = t(item.messageKey);
  const linkAria = `${t("crashSidebarTag")}. ${label}. ${t("crashSidebarSub")}`;

  return (
    <Link
      href={item.href}
      aria-label={linkAria}
      onClick={() => onNavigate?.()}
      className={cn(
        "group relative isolate mb-1 overflow-hidden rounded-2xl px-3 py-3.5 shadow-[0_0_40px_-14px_rgba(0,240,128,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 transition-[transform,box-shadow] duration-300 hover:shadow-[0_0_52px_-12px_rgba(0,240,128,0.85)] active:scale-[0.98]",
        active
          ? "bg-gradient-to-br from-[var(--color-brand)]/35 via-[#0d2818] to-[#070f14] ring-[var(--color-brand)]/65"
          : "bg-gradient-to-br from-[var(--color-brand)]/22 via-[#0c1628] to-[#070b14] ring-[var(--color-brand)]/45 hover:ring-[var(--color-brand)]/65",
      )}
    >
      <span
        className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(0,240,128,0.35),transparent_68%)] blur-md transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex flex-col gap-3">
        <div className="relative aspect-video w-full min-h-[118px] overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]">
          <LandingGridVideo
            src={assets.media.sidebarMoonCrash}
            poster={assets.crash.chart}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <span
          className="relative z-[1] flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/22 bg-[var(--color-brand)] text-[13px] font-extrabold tracking-[-0.02em] text-[var(--color-brand-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_32px_-12px_rgba(0,240,128,0.65),0_0_0_1px_rgba(0,0,0,0.35)] transition duration-300 ease-out group-hover:brightness-[1.07] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_14px_40px_-10px_rgba(0,240,128,0.75)] group-active:translate-y-px"
        >
          {tHome("crashCtaButton")}
          <ChevronRight className="h-[1.0625rem] w-[1.0625rem] opacity-95" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
