import type { MetadataRoute } from "next";
import { ROUTES, SITE, newsHref } from "@/lib/paths";
import { newsItems } from "@/lib/data/news";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();
  const paths = Object.values(ROUTES);

  const fixed: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE.url}/${locale}${path === "/" ? "" : path}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
  );

  const news: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    newsItems.map((item) => ({
      url: `${SITE.url}/${locale}${newsHref(item.slug)}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  );

  return [...fixed, ...news];
}
