import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Wallet } from "lucide-react";
import { assets } from "@/lib/assets";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function EmptyHistory({
  title,
  cta,
  href,
  description,
  emptyHeading,
  CtaIcon,
}: {
  title: string;
  cta: string;
  href: string;
  description: string;
  /** Override default “No {title} yet” line (e.g. session expired). */
  emptyHeading?: string;
  /** Icon before CTA label; pass `null` to hide. */
  CtaIcon?: LucideIcon | null;
}) {
  const Icon = CtaIcon === undefined ? Wallet : CtaIcon;
  return (
    <section className="mt-8">
      <SectionHeader icon="transactions" title={title} />
      <div className="overflow-hidden rounded-2xl bg-[var(--color-panel)]">
        <div className="eyebrow grid grid-cols-5 bg-[var(--color-panel-3)] px-4 py-3 sm:px-6">
          <span>Currency</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
          <span className="text-right">More</span>
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Image
            src={assets.hero.noMore}
            alt=""
            width={483}
            height={342}
            sizes="180px"
            className="opacity-90"
            style={{ width: 180, height: "auto" }}
          />
          <h2 className="h4">{emptyHeading ?? `No ${title.toLowerCase()} yet`}</h2>
          <p className="max-w-[40ch] text-sm font-medium text-[var(--color-text-muted)]">
            {description}
          </p>
          <Button asChild size="lg" className="mt-3">
            <Link href={href} className="inline-flex items-center gap-2">
              {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
              {cta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
