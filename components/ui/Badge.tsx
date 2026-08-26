import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.11em] leading-none",
  {
    variants: {
      variant: {
        brand:
          "bg-[var(--color-brand-soft)] text-[var(--color-brand)]",
        muted: "bg-white/5 text-[var(--color-text-muted)]",
        hot: "bg-[rgba(255,122,50,0.18)] text-[var(--color-orange)]",
        new: "bg-[rgba(52,119,232,0.18)] text-[var(--color-blue)]",
        danger:
          "bg-[rgba(255,51,104,0.18)] text-[var(--color-pink)]",
      },
    },
    defaultVariants: {
      variant: "brand",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
