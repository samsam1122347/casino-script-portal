import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { assets } from "@/lib/assets";
import { ROUTES } from "@/lib/paths";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function AboutBlock() {
  const t = await getTranslations("about");

  return (
    <section className="mt-4">
      <SectionHeader icon="info" title={t("sectionTitle")} />
      <article className="dashboard-shell relative isolate min-h-[220px] overflow-hidden p-6 sm:p-8">
        <Image
          src={assets.hero.aboutHome}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="-z-10 object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#151b35] via-[#151b35]/85 to-[#151b35]/15" />
        <h3 className="h3 max-w-[36ch]">{t("short")}</h3>
        <p className="lead mt-3 max-w-[60ch] text-sm sm:text-base">
          {t("long")}
        </p>
        <Link
          href={ROUTES.about}
          className="mt-5 inline-flex h-11 items-center gap-1 rounded-xl bg-[var(--color-panel-3)] px-4 text-sm font-bold transition-colors hover:bg-[var(--color-line)]"
        >
          {t("readAll")}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </article>
    </section>
  );
}
