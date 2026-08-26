import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * Mobile-only wordmark: bold display type with the trailing character
 * styled as a brand-green accent and a live pulse dot. Replaces the
 * plinth+text lockup on small viewports where the busy mark reads poorly.
 */
export function BrandMobile({ className }: { className?: string }) {
  const name = SITE.name || "CrashX";
  const head = name.slice(0, -1);
  const tail = name.slice(-1);

  return (
    <Link
      href={ROUTES.home}
      aria-label={`${name} home`}
      className={cn(
        "relative inline-flex shrink-0 items-baseline gap-1.5 px-0.5 transition-transform duration-200 hover:-translate-y-px",
        className,
      )}
    >
      <span className="font-display text-[1.35rem] font-black leading-none tracking-[-0.045em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] min-[360px]:text-[1.5rem]">
        {head}
        <span
          className="bg-[linear-gradient(135deg,#8fffb9_0%,var(--color-brand)_50%,#5eeedc_100%)] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(35,243,111,0.55)]"
          style={{ WebkitBackgroundClip: "text" }}
        >
          {tail}
        </span>
      </span>
      <span
        className="relative ml-0.5 inline-flex h-1.5 w-1.5 self-center"
        aria-hidden
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand)] opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_10px_rgba(35,243,111,0.85)]" />
      </span>
    </Link>
  );
}
