import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { INTERNAL_FROM_HEADER, SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { trustedRedirectOrigin } from "@/lib/request-public-origin";
import { ROUTES } from "@/lib/paths";
import { routing } from "./i18n/routing";
import { parseLocaleFromPathname } from "@/lib/i18n/pathnames";

const intlMiddleware = createIntlMiddleware(routing);

function isReservedAdminPath(pathname: string): boolean {
  /** Filament uses `ADMIN_PANEL_PATH`; `/admin` is never a portal route here */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;

  const locales = routing.locales.join("|");
  return new RegExp(`^/(?:${locales})/admin(?:/|$)`).test(pathname);
}

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/games/")) return true;
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return true;
  return false;
}

function isAuthPath(pathname: string): boolean {
  return (
    pathname === ROUTES.login ||
    pathname === ROUTES.signup ||
    pathname === ROUTES.forgotPassword
  );
}

export function proxy(request: NextRequest) {
  if (isReservedAdminPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const redirectOrigin = trustedRedirectOrigin(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    INTERNAL_FROM_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const enrichedRequest = new NextRequest(request, {
    headers: requestHeaders,
  });

  const intlResponse = intlMiddleware(enrichedRequest);

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    const loc = intlResponse.headers.get("location");
    if (loc?.includes(":3000")) {
      try {
        const u = new URL(loc, redirectOrigin);
        if (u.port === "3000") {
          const normalized = `${redirectOrigin}${u.pathname}${u.search}${u.hash}`;
          return NextResponse.redirect(normalized, intlResponse.status);
        }
      } catch {
        /* fallthrough */
      }
    }
    return intlResponse;
  }

  const rewrite = intlResponse.headers.get("x-middleware-rewrite");
  let pathname = enrichedRequest.nextUrl.pathname;
  if (rewrite) {
    try {
      pathname = new URL(rewrite, redirectOrigin).pathname;
    } catch {
      /* ignore malformed rewrite */
    }
  }

  const { locale, pathWithoutLocale } = parseLocaleFromPathname(pathname);
  const hasSession = Boolean(enrichedRequest.cookies.get(SESSION_COOKIE_NAME)?.value);
  const search = enrichedRequest.nextUrl.search;

  if (isProtectedPath(pathWithoutLocale) && !hasSession) {
    const login = new URL(`/${locale}${ROUTES.login}`, redirectOrigin);
    login.searchParams.set("from", `${pathWithoutLocale}${search}`);
    return NextResponse.redirect(login);
  }

  const returningViaFrom = enrichedRequest.nextUrl.searchParams.has("from");

  if (isAuthPath(pathWithoutLocale) && hasSession && !returningViaFrom) {
    return NextResponse.redirect(
      new URL(`/${locale}${ROUTES.home}`, redirectOrigin),
    );
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
