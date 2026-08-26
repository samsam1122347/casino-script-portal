import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/blocks/PageHero";
import { Faq } from "@/components/blocks/Faq";
import { FeatureTile } from "@/components/blocks/FeatureTile";
import { assets } from "@/lib/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "licenses" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

const certs = [
  {
    label: "Curaçao Gaming Licence",
    value: "8048/JAZ2020-013",
    detail: "Antillephone N.V., Master licensor",
  },
  {
    label: "Provably fair Crash",
    value: "Client + server seeds",
    detail: "Verify bust points and multipliers for every published round",
  },
  {
    label: "TLS / encryption",
    value: "TLS 1.3 + HSTS",
    detail: "End-to-end encryption on every payment surface",
  },
];

export default async function LicensesPage() {
  const t = await getTranslations("licenses");

  return (
    <>
      <PageHero
        title={t("title")}
        body={t("body")}
        image={assets.hero.pageLicenses}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {certs.map((cert) => (
          <FeatureTile
            key={cert.label}
            icon={<ShieldCheck className="h-5 w-5" />}
            title={cert.label}
            subtitle={cert.value}
            body={cert.detail}
          />
        ))}
      </div>
      <Faq />
    </>
  );
}
