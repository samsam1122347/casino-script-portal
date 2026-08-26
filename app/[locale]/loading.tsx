import { AnimatedBrandLogo } from "@/components/layout/AnimatedBrandLogo";
import { SITE } from "@/lib/site";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("a11y");

  return (
    <div
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-[var(--color-bg-deep)] p-6"
      role="status"
      aria-label={t("loadingSite", { siteName: SITE.name })}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(0,240,128,0.16),transparent_55%),radial-gradient(ellipse_50%_45%_at_50%_100%,rgba(138,85,255,0.1),transparent_60%)]"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative grid place-items-center">
          <span
            aria-hidden
            className="absolute h-32 w-32 rounded-full border border-[var(--color-accent-ice)]/30 spin-slow"
          />
          <span
            aria-hidden
            className="absolute h-44 w-44 rounded-full border border-dashed border-[var(--color-brand)]/20 spin-slow"
            style={{ animationDirection: "reverse", animationDuration: "32s" }}
          />
          <div className="brand-pulse relative h-[88px] w-[88px] overflow-hidden rounded-2xl drop-shadow-[0_0_30px_rgba(0,240,128,0.45)]">
            <AnimatedBrandLogo
              priority
              video
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="brand-wordmark font-display text-3xl font-extrabold leading-none">
            {SITE.name}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[var(--color-text-muted)]">
            {t("loadingTagline")}
          </span>
        </div>

        <div className="relative h-1 w-44 overflow-hidden rounded-full bg-white/[0.06]">
          <span
            aria-hidden
            className="shimmer absolute inset-0 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
