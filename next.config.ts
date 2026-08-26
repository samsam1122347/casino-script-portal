import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./i18n/routing";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isProd = process.env.NODE_ENV === "production";

const productionOnlySecurityHeaders = isProd
  ? [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ]
  : [];

/**
 * Strict CSP generated from NEXT_PUBLIC_* so dev (localhost) and prod (crashx.vip)
 * both work. `connect-src` is widened for the Laravel API + Soketi WebSocket host.
 * `'unsafe-inline'` for script is required by Next 16's app-router runtime; dev
 * additionally needs `'unsafe-eval'` for the bundler. Revisit with nonces later.
 */
function buildContentSecurityPolicy(): string {
  const safeOrigin = (raw: string | undefined): string => {
    if (!raw) return "";
    try {
      return new URL(raw).origin;
    } catch {
      return "";
    }
  };

  const apiOrigin = safeOrigin(process.env.NEXT_PUBLIC_API_URL);
  const wsHost = process.env.NEXT_PUBLIC_WS_HOST || "127.0.0.1";
  const wsScheme =
    process.env.NEXT_PUBLIC_PUSHER_SCHEME === "https" ? "wss" : "ws";
  const wsPort =
    wsScheme === "wss"
      ? process.env.NEXT_PUBLIC_WSS_PORT
      : process.env.NEXT_PUBLIC_WS_PORT;

  // Cloudflare's proxy auto-injects the Web Analytics beacon (static.cloudflareinsights.com)
  // and it reports back to cloudflareinsights.com — both must be allow-listed or the
  // browser blocks the script and logs a CSP violation on every page.
  const cloudflareScript = "https://static.cloudflareinsights.com";
  const cloudflareConnect = "https://cloudflareinsights.com";

  const connectSrc = [
    "'self'",
    apiOrigin,
    cloudflareConnect,
    `${wsScheme}://${wsHost}`,
    wsPort ? `${wsScheme}://${wsHost}:${wsPort}` : "",
  ].filter(Boolean);

  const scriptSrc = isProd
    ? `script-src 'self' 'unsafe-inline' ${cloudflareScript}`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${cloudflareScript}`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self'",
    "worker-src 'self' blob:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(self), payment=(self), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
  ...productionOnlySecurityHeaders,
];

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-toast",
      "@radix-ui/react-switch",
      "@radix-ui/react-progress",
      "@radix-ui/react-label",
      "@radix-ui/react-avatar",
    ],
  },
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // No app/page.tsx — only `app/[locale]/…` exists; proxy/intl can miss `/` in prod.
      // Send apex `/` to the default locale so https://crashx.vip loads like /en.
      {
        source: "/",
        destination: `/${routing.defaultLocale}`,
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/about-us/:path*",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/vip-club",
        destination: "/en/vip",
        permanent: true,
      },
      {
        source: "/vip-club/:path*",
        destination: "/en/vip",
        permanent: true,
      },
      {
        source: "/licence-sec",
        destination: "/en/licenses",
        permanent: true,
      },
      {
        source: "/licence-sec/:path*",
        destination: "/en/licenses",
        permanent: true,
      },
      {
        source: "/new",
        destination: "/en/news",
        permanent: true,
      },
      {
        source: "/new/:path*",
        destination: "/en/news/:path*",
        permanent: true,
      },
      {
        source: "/slot",
        destination: "/en/games/crash",
        permanent: true,
      },
      {
        source: "/games",
        destination: "/en/games/crash",
        permanent: true,
      },
      {
        source: "/bonuses",
        destination: "/en/profile/bonuses",
        permanent: true,
      },
      ...routing.locales.flatMap((locale) => [
        {
          source: `/${locale}/profile/verification`,
          destination: `/${locale}/profile`,
          permanent: true,
        },
        {
          source: `/${locale}/profile/verification/:path*`,
          destination: `/${locale}/profile`,
          permanent: true,
        },
      ]),
    ];
  },
};

export default bundleAnalyzer(withNextIntl(nextConfig));
