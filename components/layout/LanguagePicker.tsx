"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Icon } from "@/components/icons";
import { locales } from "@/lib/data/locales";
import { stripLocalePrefix } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/cn";

function queryFromCurrentLocation(): Record<string, string> {
  const query: Record<string, string> = {};
  if (typeof window === "undefined") return query;
  new URLSearchParams(window.location.search).forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

export function LanguagePicker({
  align = "start",
}: {
  align?: "start" | "center" | "end";
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const active = locales.find((l) => l.code === locale) ?? locales[0];
  const activeDir = active.code === "fa" ? "rtl" : "ltr";

  const rawPath = pathname && pathname !== "" ? pathname : "/";
  const path = stripLocalePrefix(rawPath);

  function selectLocale(nextLocale: string) {
    if (nextLocale === locale) return;

    const query = queryFromCurrentLocation();
    const hasQuery = Object.keys(query).length > 0;
    const href = hasQuery ? { pathname: path, query } : path;

    router.replace(href, { locale: nextLocale });
    queueMicrotask(() => {
      router.refresh();
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full touch-manipulation items-center justify-between gap-2 rounded-xl bg-[var(--color-panel-3)] px-3.5 py-2.5 text-sm font-extrabold tracking-tight text-white transition-colors hover:bg-[var(--color-line)]"
          aria-label={t("changeAria")}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <Icon name="language" className="h-4 w-4" />
            <span aria-hidden>{active.flag}</span>
            <span className="truncate" lang={active.code} dir={activeDir}>
              {active.label}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[14rem]">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        {locales.map((loc) => {
          const isActive = loc.code === locale;
          const rowClass = cn(
            "gap-2 pl-2",
            isActive && "bg-white/5 text-[var(--color-brand)]",
          );

          if (isActive) {
            return (
              <DropdownMenuItem key={loc.code} disabled className={rowClass}>
                <span className="grid w-4 place-items-center" aria-hidden>
                  <Check className="h-4 w-4" />
                </span>
                <span aria-hidden>{loc.flag}</span>
                {loc.label}
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={loc.code}
              className={rowClass}
              onSelect={(event) => {
                event.preventDefault();
                setOpen(false);
                selectLocale(loc.code);
              }}
            >
              <span className="grid w-4 place-items-center" aria-hidden />
              <span aria-hidden>{loc.flag}</span>
              {loc.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
