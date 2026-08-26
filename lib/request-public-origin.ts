import type { NextRequest } from "next/server";

/**
 * Origin for middleware redirects behind Caddy/nginx.
 *
 * `request.url` / default forwarding can advertise the Node listener port (`:3000`);
 * browsers cannot reach that on prod, so redirects appear to hang.
 */
export function trustedRedirectOrigin(request: NextRequest): string {
  const baked = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (baked) {
    try {
      return new URL(baked).origin;
    } catch {
      /* ignore malformed bake-time embed */
    }
  }

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (request.nextUrl.protocol === "https:" ? "https" : "http");

  const hostHeader =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.trim() ||
    "";

  if (!hostHeader) {
    return request.nextUrl.origin;
  }

  try {
    const base = `${proto === "https" ? "https" : "http"}://${hostHeader}`;
    const parsed = new URL(base);
    const defaultPort = proto === "https" ? 443 : 80;

    const xfPortRaw = request.headers.get("x-forwarded-port")?.split(",")[0]?.trim();

    let port =
      xfPortRaw !== undefined && xfPortRaw !== ""
        ? Number.parseInt(xfPortRaw, 10)
        : parsed.port !== ""
          ? Number.parseInt(parsed.port, 10)
          : defaultPort;

    if (!Number.isFinite(port)) {
      port = defaultPort;
    }

    /** TLS at edge → HTTPS to Node hits :3000; never redirect clients there */
    if (proto === "https" && port === 3000) {
      port = defaultPort;
    }

    /** Host string for serialization (IPv6 in URLs needs brackets when used with ports) */
    const host =
      parsed.hostname.includes(":") && !parsed.hostname.startsWith("[")
        ? `[${parsed.hostname}]`
        : parsed.hostname;

    return port !== defaultPort
      ? `${proto}://${host}:${port}`
      : `${proto}://${host}`;
  } catch {
    return request.nextUrl.origin;
  }
}
