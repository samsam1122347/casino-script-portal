import { routing } from "@/i18n/routing";

const localeSet = new Set<string>(routing.locales);

function normalizePath(pathname: string): string {
  if (pathname === "") return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/**
 * Strips an optional leading locale segment from a pathname (no query string).
 * Used when validating internal redirects.
 */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first !== undefined && localeSet.has(first)) {
    return segments.length <= 1 ? "/" : `/${segments.slice(1).join("/")}`;
  }
  return normalizePath(pathname);
}

/**
 * Parses `[locale]/rest` from a pathname (as used after next-intl rewrite).
 */
export function parseLocaleFromPathname(pathname: string): {
  locale: string;
  pathWithoutLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first !== undefined && localeSet.has(first)) {
    return {
      locale: first,
      pathWithoutLocale:
        segments.length <= 1 ? "/" : `/${segments.slice(1).join("/")}`,
    };
  }
  return {
    locale: routing.defaultLocale,
    pathWithoutLocale: normalizePath(pathname),
  };
}
