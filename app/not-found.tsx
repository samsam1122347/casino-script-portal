import Link from "next/link";
import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { AnimatedBrandLogo } from "@/components/layout/AnimatedBrandLogo";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";

export default async function NotFound() {
  const jar = await cookies();
  const raw = jar.get("NEXT_LOCALE")?.value;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[var(--color-bg-deep)] p-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(0,240,128,0.15),transparent_55%),radial-gradient(ellipse_60%_45%_at_50%_110%,rgba(94,238,220,0.08),transparent_55%)]"
        aria-hidden
      />
      <div className="relative max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="brand-plinth relative h-16 w-16 overflow-hidden rounded-2xl">
            <AnimatedBrandLogo
              priority
              className="absolute inset-0 z-[1] h-full w-full object-cover"
            />
          </div>
          <span className="brand-wordmark font-display text-xl font-extrabold leading-none">
            {SITE.name}
          </span>
        </div>

        <span className="eyebrow numeric inline-block rounded-full border border-[var(--color-accent-ice)]/35 bg-[var(--color-brand-soft)] px-3 py-1 !text-[var(--color-brand)]">
          {t("code")}
        </span>
        <h1 className="h1 mt-4">{t("title")}</h1>
        <p className="lead mt-3 text-sm sm:text-base">{t("description")}</p>
        <Button asChild className="mt-6">
          <Link href={`/${locale}`}>{t("backHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
