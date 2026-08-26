import Image from "next/image";
import { Handshake } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { partners } from "@/lib/data/partners";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function Partners({
  title: titleOverride,
}: {
  title?: string;
}) {
  const t = await getTranslations("partnersBlock");
  const title = titleOverride ?? t("sectionTitle");

  return (
    <section className="mt-8">
      <SectionHeader icon="sponsorship" title={title} />
      <div className="grid gap-4 sm:grid-cols-3">
        {partners.map((partner) => (
          <article
            key={partner.id}
            className="lift relative isolate min-h-[120px] overflow-hidden rounded-2xl bg-[var(--color-panel)] p-6"
          >
            <Image
              src={partner.background}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="-z-10 object-cover opacity-40"
            />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="font-display flex items-center gap-2 text-base font-extrabold tracking-[-0.025em] sm:text-lg">
                <Handshake
                  className="h-4 w-4 text-[var(--color-brand)]"
                  aria-hidden
                />
                {partner.name}
              </div>
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                {t(`${partner.id}-desc`)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
