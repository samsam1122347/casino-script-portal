import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/paths";

/**
 * `hreflang` map: locale → absolute URL for a pathname from `ROUTES` (e.g. `/`, `/games/crash`).
 */
export function alternateLanguageUrls(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((loc) => [
      loc,
      `${SITE.url}/${loc}${path === "/" ? "" : path}`,
    ]),
  );
}

export function canonicalUrl(locale: string, path: string): string {
  return `${SITE.url}/${locale}${path === "/" ? "" : path}`;
}
