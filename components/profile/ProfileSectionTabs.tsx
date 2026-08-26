"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { isNavItemActive, profileNav } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function ProfileSectionTabs() {
  const pathname = usePathname() ?? "/";
  const tNav = useTranslations("nav");

  return (
    <nav
      aria-label="Profile sections"
      className="dashboard-shell no-scrollbar flex gap-1.5 overflow-x-auto p-2"
    >
      {profileNav.map((item) => {
        const active = isNavItemActive(item, pathname);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] transition-colors",
              active
                ? "border-[var(--color-brand)]/45 bg-[var(--color-brand)]/[0.12] text-[var(--color-brand)] shadow-[0_0_24px_-12px_rgba(0,240,128,0.55)]"
                : "border-white/[0.06] bg-white/[0.02] text-white/65 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white",
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" aria-hidden />
            {tNav(item.messageKey)}
          </Link>
        );
      })}
    </nav>
  );
}
