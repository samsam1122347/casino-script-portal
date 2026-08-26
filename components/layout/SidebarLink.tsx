"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import type { NavItem } from "@/lib/types";
import { isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useSupportChat } from "@/components/support/SupportChatContext";

export function SidebarLink({
  item,
  variant = "side",
  onNavigate,
}: {
  item: NavItem;
  variant?: "side" | "profile" | "top" | "bottom";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const label = t(item.messageKey);
  const active = isNavItemActive(item, pathname ?? "/");
  const { openLiveChat } = useSupportChat();

  const handleClick = () => {
    onNavigate?.();
  };

  const handleSupportClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (item.href === "#support") {
      e.preventDefault();
      openLiveChat();
    }
    handleClick();
  };

  if (variant === "top") {
    return (
      <Link
        href={item.href}
        onClick={handleSupportClick}
        className={cn(
          "relative inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-[color,background-color,box-shadow,transform]",
          active
            ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.02)_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(35,243,111,0.28),0_8px_32px_-16px_rgba(35,243,111,0.45)]"
            : "text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] active:translate-y-px",
        )}
      >
        <Icon
          name={item.icon}
          className={cn(
            "h-4 w-4",
            active
              ? "text-[var(--color-brand)] drop-shadow-[0_0_10px_rgba(35,243,111,0.35)]"
              : "text-current",
          )}
          aria-hidden
        />
        {label}
      </Link>
    );
  }

  if (variant === "bottom") {
    return (
      <Link
        href={item.href}
        onClick={handleSupportClick}
        className={cn(
          "group relative z-10 flex h-[56px] min-h-[56px] max-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] select-none transition-[color,transform] active:scale-[0.98]",
          active
            ? "text-[var(--color-brand)]"
            : "text-[var(--color-text-muted)] hover:text-white/90",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-1 inset-y-1 rounded-[0.8rem] transition-[opacity,box-shadow] duration-200",
            active
              ? "opacity-100 bg-gradient-to-b from-[var(--color-brand)]/18 via-white/[0.04] to-transparent shadow-[inset_0_0_0_1px_rgba(94,238,220,0.12),inset_0_1px_0_rgba(255,255,255,0.11)]"
              : "opacity-0 shadow-none group-hover:opacity-100 group-hover:bg-white/[0.05] group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]",
          )}
          aria-hidden
        />
        <Icon
          name={item.icon}
          className={cn(
            "relative z-10 h-5 w-5 shrink-0 transition-[color,filter,transform] duration-200",
            active
              ? "text-[var(--color-brand)] drop-shadow-[0_0_12px_rgba(0,240,128,0.42)]"
              : "text-white/85 group-hover:text-white",
          )}
          aria-hidden
        />
        <span className="relative z-10 max-w-full shrink-0 truncate text-[10px] font-extrabold leading-tight tracking-[0.04em]">
          {label}
        </span>
      </Link>
    );
  }

  if (variant === "profile") {
    return (
      <Link
        href={item.href}
        onClick={handleSupportClick}
        className={cn(
          "flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold transition-colors",
          active
            ? "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
            : "bg-[var(--color-panel)] text-white hover:bg-white/5",
        )}
      >
        <Icon
          name={item.icon}
          className={cn(
            "h-4 w-4",
            active ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]",
          )}
          aria-hidden
        />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={handleSupportClick}
      className={cn(
        "relative flex min-h-[44px] touch-manipulation items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-bold transition-colors",
        active
          ? "bg-[linear-gradient(90deg,rgba(35,243,111,0.16),rgba(255,255,255,0.055))] text-white shadow-[inset_0_0_0_1px_rgba(35,243,111,0.18),inset_0_1px_0_rgba(255,255,255,0.09)]"
          : "text-[var(--color-text)]/84 hover:bg-white/[0.055] hover:text-white",
      )}
    >
      <Icon
        name={item.icon}
        className={cn(
          "h-4 w-4",
          active ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]",
        )}
        aria-hidden
      />
      {label}
    </Link>
  );
}
