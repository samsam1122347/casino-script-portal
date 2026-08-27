import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://crashflyy.com"),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default("CrashX"),
  NEXT_PUBLIC_SITE_TAGLINE: z
    .string()
    .min(1)
    .default("Crypto Crash — provably fair, instant payouts"),
  NEXT_PUBLIC_SITE_DESCRIPTION: z
    .string()
    .min(1)
    .default(
      "CrashX — provably fair Crash, fast crypto withdrawals, clear limits. Play responsibly — 18+.",
    ),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().default("support@crashx.com"),
  /** Laravel Sail default (port 80). Prefer 127.0.0.1 — `localhost` can hang on IPv6 vs Docker. */
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("https://dashboard.crashflyy.com"),
  NEXT_PUBLIC_TENANT_SLUG: z.string().min(1).default("crashx"),
  /** Public Soketi/Pusher key only — never put the app secret in Next.js. */
  NEXT_PUBLIC_PUSHER_APP_KEY: z.string().optional().default("local-crashx-key"),
  /** When false, Echo is never instantiated (no WS attempts — use if Soketi is not running). */
  NEXT_PUBLIC_REALTIME_ENABLED: z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined || raw === "") return true;
      const v = raw.trim().toLowerCase();
      return !(
        v === "false" ||
        v === "0" ||
        v === "off" ||
        v === "no"
      );
    }),
  NEXT_PUBLIC_PUSHER_APP_CLUSTER: z.string().default("mt1"),
  NEXT_PUBLIC_WS_HOST: z.string().default("crashflyy.com"),
  NEXT_PUBLIC_WS_PORT: z.coerce.number().default(443),
  NEXT_PUBLIC_WSS_PORT: z.coerce.number().default(443),
  NEXT_PUBLIC_PUSHER_SCHEME: z.enum(["http", "https"]).default("https"),
  /** When omitted, signed-in players use Laravel wallet staking (production default). Set false for frontend-only practice. */
  NEXT_PUBLIC_CRASH_REAL_MONEY: z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined || raw === "") return true;
      const v = raw.trim().toLowerCase();
      if (
        v === "false" ||
        v === "0" ||
        v === "off" ||
        v === "no"
      )
        return false;
      return true;
    }),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_TAGLINE: process.env.NEXT_PUBLIC_SITE_TAGLINE,
  NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_TENANT_SLUG: process.env.NEXT_PUBLIC_TENANT_SLUG,
  NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  NEXT_PUBLIC_REALTIME_ENABLED: process.env.NEXT_PUBLIC_REALTIME_ENABLED,
  NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
  NEXT_PUBLIC_WS_HOST: process.env.NEXT_PUBLIC_WS_HOST,
  NEXT_PUBLIC_WS_PORT: process.env.NEXT_PUBLIC_WS_PORT,
  NEXT_PUBLIC_WSS_PORT: process.env.NEXT_PUBLIC_WSS_PORT,
  NEXT_PUBLIC_PUSHER_SCHEME: process.env.NEXT_PUBLIC_PUSHER_SCHEME,
  NEXT_PUBLIC_CRASH_REAL_MONEY: process.env.NEXT_PUBLIC_CRASH_REAL_MONEY,
});

if (!parsed.success) {
  console.warn(
    "[env] Invalid environment variables — falling back to defaults.",
    parsed.error.flatten().fieldErrors,
  );
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
