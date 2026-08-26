import type { MetadataRoute } from "next";
import { SITE } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/profile/"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
