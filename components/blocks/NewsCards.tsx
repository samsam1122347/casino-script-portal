import { newsItems } from "@/lib/data/news";
import { ROUTES } from "@/lib/paths";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsCard } from "./NewsCard";
import { getTranslations } from "next-intl/server";

export async function NewsCards({ limit = 3 }: { limit?: number }) {
  const items = newsItems.slice(0, limit);
  const tNews = await getTranslations("news");
  const tBlock = await getTranslations("newsBlock");

  return (
    <section className="dashboard-shell mt-4 p-4 sm:p-5">
      <SectionHeader
        icon="news"
        title={tNews("title")}
        href={ROUTES.news}
        ctaLabel={tBlock("viewAll")}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} imageHeightClass="h-40" />
        ))}
      </div>
    </section>
  );
}
