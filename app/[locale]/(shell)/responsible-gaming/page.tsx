import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { FeatureTile } from "@/components/blocks/FeatureTile";
import { assets } from "@/lib/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "responsibleGaming" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function ResponsibleGamingPage() {
  const t = await getTranslations("responsibleGaming");

  const tools = [
    {
      title: t("depositLimitsTitle"),
      body: t("depositLimitsBody"),
    },
    {
      title: t("lossLimitsTitle"),
      body: t("lossLimitsBody"),
    },
    {
      title: t("timeoutTitle"),
      body: t("timeoutBody"),
    },
    {
      title: t("selfExclusionTitle"),
      body: t("selfExclusionBody"),
    },
  ];

  return (
    <>
      <PageHero
        title={t("title")}
        body={t("body")}
        image={assets.hero.pageVip}
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <FeatureTile
            key={tool.title}
            icon={<Shield className="h-5 w-5" />}
            title={tool.title}
            body={tool.body}
          />
        ))}
      </section>
      <section className="mt-8 rounded-2xl bg-[var(--color-panel)] p-6 sm:p-8">
        <h2 className="h3">{t("helpHeading")}</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--color-text-muted)] sm:text-base">
          {t("helpIntro")}
        </p>
        <ul className="mt-3 grid gap-1.5 text-sm font-bold text-[var(--color-brand)]">
          <li>
            <a
              href="https://www.gamblersanonymous.org/"
              target="_blank"
              rel="noreferrer"
            >
              Gamblers Anonymous
            </a>
          </li>
          <li>
            <a
              href="https://www.begambleaware.org/"
              target="_blank"
              rel="noreferrer"
            >
              BeGambleAware (UK)
            </a>
          </li>
          <li>
            <a
              href="https://www.ncpgambling.org/"
              target="_blank"
              rel="noreferrer"
            >
              National Council on Problem Gambling (US)
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
