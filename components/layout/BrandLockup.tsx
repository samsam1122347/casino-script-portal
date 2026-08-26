import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";
import { AnimatedBrandLogo } from "@/components/layout/AnimatedBrandLogo";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<
  Size,
  {
    plinth: string;
    wordmark: string;
    gap: string;
  }
> = {
  sm: {
    plinth: "h-9 w-9 rounded-[10px]",
    wordmark: "text-lg",
    gap: "gap-2",
  },
  md: {
    plinth: "h-11 w-11 rounded-[12px]",
    wordmark: "text-[1.375rem]",
    gap: "gap-2.5",
  },
  lg: {
    plinth: "h-14 w-14 rounded-[14px]",
    wordmark: "text-[1.75rem]",
    gap: "gap-3",
  },
};

export function BrandLockup({
  size = "md",
  href = ROUTES.home,
  showWordmark = true,
  wordmarkClassName,
  onClick,
  className,
  priority = false,
}: {
  size?: Size;
  href?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}) {
  const cfg = SIZE_MAP[size];

  const inner = (
    <>
      <span
        aria-hidden
        className={cn("brand-plinth shrink-0", cfg.plinth)}
      >
        <AnimatedBrandLogo
          priority={priority}
          className="absolute inset-0 z-[1] h-full w-full object-cover"
        />
      </span>
      {showWordmark ? (
        <span
          className={cn("flex min-w-0 flex-col leading-none", wordmarkClassName)}
        >
          <span
            className={cn(
              "brand-wordmark font-display font-extrabold",
              cfg.wordmark,
            )}
          >
            {SITE.name}
          </span>
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex items-center", cfg.gap, className)}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${SITE.name} home`}
      className={cn(
        "inline-flex items-center transition-transform duration-200 hover:translate-y-[-1px]",
        cfg.gap,
        className,
      )}
    >
      {inner}
    </Link>
  );
}
