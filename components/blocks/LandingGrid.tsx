import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Crown, Rocket, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { assets } from "@/lib/assets";
import { ROUTES } from "@/lib/paths";
import { LandingGridVideo } from "@/components/blocks/LandingGridVideo";

type CardSpec = {
  href: (typeof ROUTES)[keyof typeof ROUTES];
  image: string;
  video: string;
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
};

export async function LandingGrid() {
  const t = await getTranslations("landing");
  const cards: CardSpec[] = [
    {
      href: ROUTES.crash,
      image: assets.crash.rocket,
      video: assets.media.landingPlayCrash,
      title: t("originalsTitle"),
      body: t("originalsBody"),
      icon: Rocket,
      tone: "from-[#36126d] via-[#15133e] to-[#090d1e]",
    },
    {
      href: ROUTES.promotions,
      image: assets.hero.gift,
      video: assets.media.landingPromotions,
      title: t("promoCardTitle"),
      body: t("promoCardBody"),
      icon: Trophy,
      tone: "from-[#063c2f] via-[#101c3b] to-[#090d1e]",
    },
    {
      href: ROUTES.vip,
      image: assets.hero.vipCar,
      video: assets.media.landingVip,
      title: t("promoCardVipTitle"),
      body: t("promoCardVipBody"),
      icon: Crown,
      tone: "from-[#3b1b05] via-[#181337] to-[#090d1e]",
    },
  ];

  return (
    <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Link
          key={card.href}
          href={card.href}
          aria-label={`${card.title}. ${card.body}`}
          className="dashboard-card lift group relative isolate flex min-h-[230px] overflow-hidden sm:min-h-[240px] lg:min-h-[260px]"
        >
          <div
            className={`absolute inset-0 -z-20 bg-gradient-to-br ${card.tone}`}
            aria-hidden
          />
          <div className="absolute inset-0 -z-10" aria-hidden>
            <LandingGridVideo
              src={card.video}
              poster={card.image}
              priority={index === 0}
              className="h-full w-full object-cover opacity-[0.97] transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-br from-black/45 via-transparent to-black/55"
            aria-hidden
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-black/35 text-[var(--color-brand)] ring-1 ring-white/[0.12] backdrop-blur-sm">
              <card.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="sr-only">
              <span className="block font-semibold">{card.title}</span>
              <span>{card.body}</span>
            </span>
            <span
              className="ml-auto mt-auto grid size-10 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/[0.12] backdrop-blur-sm transition-transform group-hover:rotate-12"
              aria-hidden
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
