import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { BrandLockup } from "@/components/layout/BrandLockup";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatSupport } from "@/components/layout/FloatSupport";
import { FooterInstallApp } from "@/components/pwa/FooterInstallApp";
import { getSessionUser } from "@/lib/server/session-user";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("authLayout");
  const user = await getSessionUser();
  const authed = Boolean(user);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[var(--color-bg)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-25%,rgba(0,240,128,0.11),transparent_58%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(138,85,255,0.09),transparent_48%)]"
        aria-hidden
      />
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-6">
        <BrandLockup size="md" priority />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <FooterInstallApp />
          </div>
          <Link
            href={ROUTES.home}
            className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-text-muted)] transition-colors hover:text-white sm:text-sm"
          >
            {t("backToSite")}
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[calc(100dvh-5.5rem)] items-center justify-center px-4 pb-28 pt-2 max-lg:pb-32 sm:min-h-[calc(100dvh-6rem)] sm:px-6">
        {children}
      </div>

      <BottomNav authed={authed} />
      <FloatSupport />
    </div>
  );
}
