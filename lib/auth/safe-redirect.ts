import { ROUTES } from "@/lib/paths";
import { stripLocalePrefix } from "@/lib/i18n/pathnames";

const AUTH_PATHS = [ROUTES.login, ROUTES.signup, ROUTES.forgotPassword] as const;

/**
 * Strip locale segment from pathname and preserve query string.
 * next-intl `router.push` expects paths without a locale prefix.
 */
function withoutLocalePrefix(pathWithOptionalSearch: string): string {
  const q = pathWithOptionalSearch.indexOf("?");
  const pathOnly = q === -1 ? pathWithOptionalSearch : pathWithOptionalSearch.slice(0, q);
  const search = q === -1 ? "" : pathWithOptionalSearch.slice(q);
  const stripped = stripLocalePrefix(pathOnly);
  return `${stripped}${search}`;
}

/**
 * Returns a safe same-origin path for post-login redirects (blocks open redirects / auth loops).
 * Output is always locale-prefix-free so `router.push` from `@/i18n/navigation` resolves correctly.
 */
export function safeInternalRedirect(
  value: string | undefined | null,
  fallback: string,
): string {
  const fb = withoutLocalePrefix(fallback);

  if (value == null || value === "") return fb;
  if (!value.startsWith("/") || value.startsWith("//")) return fb;
  if (value.includes("://") || value.includes("\\")) return fb;

  const pathOnly = value.split("?")[0] ?? "";
  const normalized = stripLocalePrefix(pathOnly);

  for (const p of AUTH_PATHS) {
    if (normalized === p || normalized.startsWith(`${p}/`)) return fb;
  }

  return withoutLocalePrefix(value);
}
