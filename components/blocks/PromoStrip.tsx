import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { assets } from "@/lib/assets";

export async function PromoStrip() {
  const t = await getTranslations("promoStrip");

  return (
    <section className="mt-4 md:mt-5">
      <article className="strip-highlight-top corner-accent-surface relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--chrome-border)] bg-gradient-to-br from-[#1e3468] via-[var(--color-panel-2)] to-[var(--color-panel)] p-5 shadow-[var(--shadow-chrome)]">
        <div
          className="pointer-events-none absolute right-0 top-0 z-[1] h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-[radial-gradient(circle,rgba(94,238,220,0.14),transparent_68%)]"
          aria-hidden
        />
        <Image
          src={assets.hero.gift}
          alt=""
          width={64}
          height={64}
          className="relative z-10 h-16 w-16 object-contain"
        />
        <div className="relative z-10 min-w-0 flex-1">
          <h3 className="font-display text-base font-extrabold tracking-[-0.025em] sm:text-lg">
            {t("rewardsTitle")}
          </h3>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
            {t("rewardsBody")}
          </p>
        </div>
        <span className="eyebrow relative z-10 hidden rounded-full bg-[var(--color-brand-soft)] px-3 py-1 !text-[var(--color-brand)] sm:inline-flex">
          {t("ribbon")}
        </span>
      </article>
    </section>
  );
}
