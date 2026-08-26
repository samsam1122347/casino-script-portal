import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const startUrl = `/${routing.defaultLocale}/`;

  return {
    id: new URL(startUrl, SITE.url).href,
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "any",
    background_color: "#080d1a",
    theme_color: "#080d1a",
    categories: ["games", "entertainment"],
    lang: routing.defaultLocale,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
