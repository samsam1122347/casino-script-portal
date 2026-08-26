import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import type { IconName } from "@/lib/types";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function SectionHeader({
  icon,
  iconNode,
  title,
  href,
  ctaLabel = "View all",
  className,
}: {
  icon?: IconName;
  iconNode?: React.ReactNode;
  title: React.ReactNode;
  href?: string;
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between gap-3",
        className,
      )}
    >
      <h2 className="font-display flex items-center gap-2.5 text-[1.25rem] font-extrabold leading-tight sm:text-[1.45rem]">
        {iconNode ?? (icon ? (
          <Icon
            name={icon}
            className="h-5 w-5 text-[var(--color-brand)]"
            aria-hidden
          />
        ) : null)}
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 text-sm font-bold transition-colors hover:bg-white/[0.07]"
        >
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
