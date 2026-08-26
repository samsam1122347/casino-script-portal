import Image from "next/image";
import { SITE } from "@/lib/site";

export function PageHero({
  title,
  body,
  image,
}: {
  title: string;
  body: string;
  image: string;
}) {
  return (
    <section className="dashboard-shell relative isolate mb-5 min-h-[220px] overflow-hidden p-6 sm:min-h-[250px] sm:p-8 lg:min-h-[290px] lg:p-10">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        priority
        className="-z-10 object-cover object-right opacity-90"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_65%_at_82%_20%,rgba(35,243,111,0.12),transparent_62%),linear-gradient(90deg,rgba(3,5,14,0.94)_0%,rgba(8,13,32,0.86)_48%,rgba(8,13,32,0.34)_100%)]" />
      <span className="inline-flex rounded-full border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-brand)]">
        {SITE.name}
      </span>
      <h1 className="h1 mt-4 max-w-[13ch]">{title}</h1>
      <p className="lead mt-3 max-w-[58ch] text-sm sm:text-base">{body}</p>
    </section>
  );
}
