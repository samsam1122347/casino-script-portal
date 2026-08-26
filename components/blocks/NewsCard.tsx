import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/format";
import { newsHref } from "@/lib/paths";
import type { NewsItem } from "@/lib/types";

export async function NewsCard({
  item,
  headingTag = "h3",
  imageHeightClass = "h-44",
}: {
  item: NewsItem;
  headingTag?: "h2" | "h3";
  imageHeightClass?: string;
}) {
  const t = await getTranslations("newsArticles");
  const itemKey =
    item.id === "trust-wallet-deposit"
      ? "items.trust-wallet-deposit"
      : "items.bank-card-deposit";

  const HeadingTag = headingTag;
  return (
    <article className="overflow-hidden rounded-2xl bg-[var(--color-panel)]">
      <Link href={newsHref(item.slug)} className="block">
        <div className={`relative w-full ${imageHeightClass}`}>
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="p-5">
        <span className="eyebrow !text-[var(--color-brand)]">
          {t(`${itemKey}.category`)} ·{" "}
          <span className="numeric">{formatDate(item.publishedAt)}</span>
        </span>
        <HeadingTag className="font-display mt-2 text-lg font-extrabold leading-snug tracking-[-0.025em]">
          <Link href={newsHref(item.slug)}>{t(`${itemKey}.title`)}</Link>
        </HeadingTag>
        <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">
          {t(`${itemKey}.excerpt`)}
        </p>
        <Link
          href={newsHref(item.slug)}
          className="mt-3 inline-block text-sm font-bold text-[var(--color-brand)]"
        >
          {t("readMore")}
        </Link>
      </div>
    </article>
  );
}
