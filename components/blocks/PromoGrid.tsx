import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { promotions } from "@/lib/data/promotions";
import { ROUTES } from "@/lib/paths";
import { Badge } from "@/components/ui/Badge";

const BADGE_KEYS = {
  Daily: "badgeDaily",
  Weekly: "badgeWeekly",
  Partner: "badgePartner",
} as const;

export async function PromoGrid() {
  const t = await getTranslations("promotionsGrid");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {promotions.map((promo) => {
        const badgeKey =
          promo.badge &&
          promo.badge in BADGE_KEYS
            ? BADGE_KEYS[promo.badge as keyof typeof BADGE_KEYS]
            : null;
        return (
          <article
            key={promo.id}
            className="lift flex gap-4 overflow-hidden rounded-2xl bg-[var(--color-panel)] p-4 ring-1 ring-white/[0.08] shadow-[var(--shadow-chrome)]"
          >
            <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl">
              <Image
                src={promo.image}
                alt=""
                fill
                sizes="88px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-extrabold tracking-[-0.025em] sm:text-lg">
                  {t(`${promo.id}-title`)}
                </h3>
                {badgeKey ? (
                  <Badge variant="brand">{t(badgeKey)}</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
                {t(`${promo.id}-desc`)}
              </p>
              <Link
                href={ROUTES.promotions}
                className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-brand)]"
              >
                {t("detailsLink")}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
