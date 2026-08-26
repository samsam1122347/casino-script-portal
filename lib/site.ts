import { env } from "./env";

/** Site branding + SEO defaults (override via NEXT_PUBLIC_SITE_* env). */
export const SITE = {
  url: env.NEXT_PUBLIC_SITE_URL,
  name: env.NEXT_PUBLIC_SITE_NAME,
  tagline: env.NEXT_PUBLIC_SITE_TAGLINE,
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
} as const;
