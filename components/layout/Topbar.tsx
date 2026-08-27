import { MessageCircle, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ROUTES } from "@/lib/paths";
import { topNavForViewer } from "@/lib/nav";
import { assets } from "@/lib/assets";
import { SidebarLink } from "./SidebarLink";
import { MobileDrawer } from "./MobileDrawer";
import { BalancePill } from "./BalancePill";
import { BrandMobile } from "./BrandMobile";
import { LogoutForm } from "@/components/auth/LogoutForm";
import { getSessionUser } from "@/lib/server/session-user";
import { cn } from "@/lib/cn";

export async function TopbarActions() {
  const [t, tNav, user] = await Promise.all([
    getTranslations("topbar"),
    getTranslations("nav"),
    getSessionUser(),
  ]);
  const balanceMajor =
    user?.wallet?.balance_minor != null ? user.wallet.balance_minor / 100 : 0;

  return (
    <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-2.5">
      {user ? (
        <>
          <BalancePill
            balanceMajor={balanceMajor}
            size="compact"
            className="md:hidden"
          />
          <BalancePill
            balanceMajor={balanceMajor}
            className="hidden md:block"
            size="compact"
          />
          <Link
            href={ROUTES.deposit}
            aria-label={t("deposit")}
            className="btn-premium-primary inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/45 px-3 font-bold tracking-[-0.01em] text-[var(--color-brand-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_0_1px_rgba(0,0,0,0.35),0_6px_22px_-8px_rgba(0,240,128,0.55)] transition-[transform,filter,box-shadow] hover:brightness-[1.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_0_1px_rgba(0,0,0,0.32),0_10px_32px_-10px_rgba(0,240,128,0.65)] active:translate-y-px sm:min-h-11 sm:min-w-0 sm:px-4"
          >
            <Wallet className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{t("deposit")}</span>
          </Link>
          <a
            href="#support"
            aria-label="Support"
            className="hidden size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.07] hover:text-white xl:grid"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
          </a>
          <LogoutForm className="hidden sm:inline-flex" />
          <Link
            href={ROUTES.profile}
            aria-label={tNav("profile")}
            className="inline-flex shrink-0 items-center"
          >
            <Avatar className="size-9 ring-2 ring-[var(--color-brand)]/30 ring-offset-2 ring-offset-[var(--color-bg)] sm:size-11 sm:ring-white/15 sm:ring-offset-[var(--color-bg)]">
              <AvatarImage src={assets.avatars.a22} alt="" />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        </>
      ) : (
        <>
          <div className="mr-0.5 hidden min-w-0 items-center gap-2.5 md:flex">
            <Link
              href={ROUTES.login}
              className="btn-premium-outline inline-flex min-h-11 items-center rounded-full px-5 text-sm font-extrabold text-white transition-[filter,transform] hover:brightness-110"
            >
              {t("login")}
            </Link>
            <Link
              href={ROUTES.signup}
              className="btn-premium-primary inline-flex min-h-11 items-center rounded-full border border-black/40 px-5 text-sm font-extrabold tracking-[-0.01em] text-[var(--color-brand-dark)] transition-[transform,filter,box-shadow] hover:brightness-[1.04] active:translate-y-px"
            >
              {t("signup")}
            </Link>
          </div>
          <Link
            href={ROUTES.login}
            className="btn-premium-outline inline-flex min-h-10 items-center rounded-full px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.07em] text-white transition-[filter,transform] hover:brightness-110 active:translate-y-px md:hidden"
          >
            {t("login")}
          </Link>
          <Link
            href={ROUTES.signup}
            className="btn-premium-primary inline-flex min-h-10 items-center rounded-full border border-black/40 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[var(--color-brand-dark)] transition-[transform,filter] hover:brightness-[1.04] active:translate-y-px md:hidden"
          >
            {t("signup")}
          </Link>
        </>
      )}
    </div>
  );
}

export async function Topbar({ authed }: { authed: boolean }) {
  const user = await getSessionUser();
  const userPreview = user
    ? {
        displayName: user.name || user.username || "Player",
        username: user.username,
        balanceMajor:
          user.wallet?.balance_minor != null
            ? user.wallet.balance_minor / 100
            : 0,
        avatarSrc: assets.avatars.a22,
      }
    : undefined;
  return (
    <header
      className={cn(
        "sticky top-0 z-[60] isolate overflow-hidden border-b border-[var(--chrome-border)] lg:relative",
        "bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] backdrop-blur-xl backdrop-saturate-[1.4]",
        "shadow-[0_10px_42px_-28px_rgba(0,0,0,0.75)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(138,85,255,0.08)_0%,transparent_48%,rgba(3,5,14,0.45)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_92%_140%_at_50%_-55%,rgba(35,243,111,0.11),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,rgba(138,85,255,0.4)_16%,var(--color-brand)_52%,rgba(94,238,220,0.75)_84%,transparent_100%)] opacity-90"
      />

      <div className="relative z-[1] flex min-h-[56px] w-full items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:min-h-[72px] sm:gap-3 sm:px-5 sm:py-2 lg:gap-3 lg:px-5 xl:px-6">
        <MobileDrawer authed={authed} userPreview={userPreview} />

        <BrandMobile className="lg:hidden" />

        <nav
          aria-label="Top"
          className="hidden min-w-0 flex-1 items-center justify-start gap-0.5 overflow-hidden md:flex lg:gap-1 xl:gap-1.5"
        >
          {topNavForViewer(authed).map((item) => (
            <SidebarLink key={item.id} item={item} variant="top" />
          ))}
        </nav>

        <TopbarActions />
      </div>
    </header>
  );
}
