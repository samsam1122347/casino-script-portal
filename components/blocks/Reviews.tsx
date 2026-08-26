import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { reviews } from "@/lib/data/reviews";
import { ROUTES } from "@/lib/paths";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function Reviews() {
  const t = await getTranslations("reviewsBlock");
  const tNewsBlock = await getTranslations("newsBlock");

  return (
    <section className="mt-8">
      <SectionHeader
        icon="feedback"
        title={t("sectionTitle")}
        href={ROUTES.feedback}
        ctaLabel={tNewsBlock("viewAll")}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="overflow-hidden rounded-2xl bg-[var(--color-panel)]"
          >
            <header className="flex items-center gap-3 bg-[var(--color-panel-3)] p-4">
              <Image
                src={review.avatar}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <strong className="block text-sm font-bold tracking-tight">
                  {review.username}
                </strong>
                <span className="block text-xs font-medium text-[var(--color-text-muted)]">
                  {t("playerSince")}{" "}
                  <span className="numeric">{review.joinedYear}</span>
                </span>
              </div>
            </header>
            <div className="p-5">
              <div
                className="mb-3 flex items-center gap-0.5 text-[var(--color-brand)]"
                aria-label={t("starsAria", { rating: review.rating })}
              >
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-text-muted)]">
                {t(`${review.id}-body`)}
              </p>
              <Link
                href={ROUTES.feedback}
                className="mt-3 inline-block text-sm font-bold text-[var(--color-brand)]"
              >
                {t("readMore")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
