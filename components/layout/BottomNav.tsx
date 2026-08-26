"use client";

import { useTranslations } from "next-intl";
import { bottomNavForViewer } from "@/lib/nav";
import { SidebarLink } from "./SidebarLink";

export function BottomNav({ authed }: { authed: boolean }) {
  const t = useTranslations("nav");
  return (
    <nav
      aria-label={t("mobile")}
      className="isolate z-[90] grid grid-cols-4 items-center overflow-hidden rounded-t-2xl border-x border-t border-[var(--chrome-border)] border-b-0 bg-[var(--color-bg-deep)]/96 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-20px_50px_-16px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(94,238,220,0.1)] backdrop-blur-2xl backdrop-saturate-150 max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:w-full lg:hidden"
    >
      <span
        className="pointer-events-none absolute left-4 right-4 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[var(--color-accent-ice)]/35 to-transparent"
        aria-hidden
      />
      {bottomNavForViewer(authed).map((item) => (
        <SidebarLink key={item.id} item={item} variant="bottom" />
      ))}
    </nav>
  );
}
