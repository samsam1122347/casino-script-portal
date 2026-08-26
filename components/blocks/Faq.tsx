import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteSchema } from "@/components/seo/SiteSchema";
import { getTranslations } from "next-intl/server";

const FAQ_IDS = [
  "deposit-methods",
  "claim-bonus",
  "verify-account",
  "is-safe",
  "withdraw",
  "support",
] as const;

export async function Faq() {
  const t = await getTranslations("faqSection");

  return (
    <section className="dashboard-shell mt-4 p-4 sm:p-5">
      <SectionHeader
        title={t("sectionTitle")}
        iconNode={
          <HelpCircle
            className="h-5 w-5 text-[var(--color-brand)]"
            aria-hidden
          />
        }
      />
      <Accordion type="single" collapsible className="grid gap-2">
        {FAQ_IDS.map((id) => (
          <AccordionItem key={id} value={id}>
            <AccordionTrigger>{t(`${id}-q`)}</AccordionTrigger>
            <AccordionContent>{t(`${id}-a`)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <SiteSchema
        kind="faq"
        faqEntities={FAQ_IDS.map((id) => ({
          question: t(`${id}-q`),
          answer: t(`${id}-a`),
        }))}
      />
    </section>
  );
}
