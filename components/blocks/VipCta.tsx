import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Trophy } from "lucide-react";
import { assets } from "@/lib/assets";
import { ROUTES } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function VipCta() {
  const t = await getTranslations("vipCta");
  const tNav = await getTranslations("nav");

  return (
    <section className="mt-4">
      <SectionHeader icon="vip" title={tNav("vip")} />
      <article className="dashboard-shell relative isolate min-h-[190px] overflow-hidden p-6 sm:p-8">
        <Image
          src={assets.hero.vipCar}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="-z-10 object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071123] via-[#071123]/86 to-transparent" />
        <h2 className="h2 max-w-[28ch]">
          {t("title")} at{" "}
          <b className="text-[var(--color-brand)]">{SITE.name}</b>
        </h2>
        <p className="lead mt-3 max-w-[40ch] text-sm sm:text-base">
          {t("body")}
        </p>
        <Link
          href={ROUTES.vip}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 text-sm font-bold tracking-[-0.01em] text-[var(--color-brand-dark)] hover:brightness-110"
        >
          <Trophy className="h-4 w-4" /> {t("cta")}
        </Link>
      </article>
    </section>
  );
}
